/**
 * Content Extraction Service
 * Extracts text content from various file types for AI context
 *
 * Heavy parsers (mammoth, xlsx, pdf-parse) are dynamically imported
 * to optimize bundle size - only loaded when file needs extraction
 */

export interface ExtractionResult {
  text: string;
  wordCount: number;
  tokenCount: number;
  extractionMethod: "full" | "partial" | "failed";
  error?: string;
}

const MAX_CONTENT_SIZE = 100 * 1024; // 100KB
const CHARS_PER_TOKEN = 4; // Rough estimate

// Lazy-loaded parsers (only imported when needed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfParser: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mammothModule: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let xlsxModule: any = null;

/**
 * Lazily get PDF parser
 */
async function getPdfParser() {
  if (!pdfParser) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import("pdf-parse") as any;
    pdfParser = mod.default || mod;
  }
  return pdfParser;
}

/**
 * Lazily get Mammoth DOCX parser
 */
async function getMammoth() {
  if (!mammothModule) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mammothModule = await import("mammoth") as any;
  }
  return mammothModule;
}

/**
 * Lazily get XLSX parser
 */
async function getXlsx() {
  if (!xlsxModule) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xlsxModule = await import("xlsx") as any;
  }
  return xlsxModule;
}

/**
 * Extract content from buffer based on MIME type
 */
export async function extractFileContent(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  try {
    switch (mimeType) {
      case "text/plain":
      case "text/markdown":
        return extractText(buffer);

      case "application/json":
        return extractJson(buffer);

      case "text/csv":
        return extractCsv(buffer);

      case "application/pdf":
        return extractPdf(buffer);

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/msword":
        return extractDocx(buffer);

      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.ms-excel":
        return extractExcel(buffer);

      default:
        return {
          text: "",
          wordCount: 0,
          tokenCount: 0,
          extractionMethod: "failed",
          error: `Unsupported content type: ${mimeType}`,
        };
    }
  } catch (error) {
    return {
      text: "",
      wordCount: 0,
      tokenCount: 0,
      extractionMethod: "failed",
      error: error instanceof Error ? error.message : "Extraction failed",
    };
  }
}

/**
 * Extract plain text
 */
function extractText(buffer: Buffer): ExtractionResult {
  const text = buffer.toString("utf-8");
  return createResult(text);
}

/**
 * Extract JSON - format and stringify
 */
function extractJson(buffer: Buffer): ExtractionResult {
  const text = buffer.toString("utf-8");
  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);
    return createResult(formatted);
  } catch {
    return createResult(text);
  }
}

/**
 * Extract CSV - convert to structured text
 */
function extractCsv(buffer: Buffer): ExtractionResult {
  const text = buffer.toString("utf-8");
  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return createResult("");
  }

  // Parse header
  const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1, 11); // First 10 data rows

  const formatted = rows
    .map((row) => {
      const values = row.split(",").map((v) => v.trim().replace(/"/g, ""));
      return header
        .map((h, i) => `${h}: ${values[i] || ""}`)
        .join(" | ");
    })
    .join("\n");

  return createResult(formatted);
}

/**
 * Extract PDF text with smart chunking for large documents
 */
async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const PDFParser = await getPdfParser();
    const parser = new PDFParser({ data: buffer });
    const textResult = await parser.getText();

    // Check if PDF has many pages - use smart chunking
    const pageCount = textResult.pages?.length || 1;

    if (pageCount > 10 && textResult.text.length > MAX_CONTENT_SIZE) {
      // For large PDFs: extract beginning, middle sample, and end
      return extractLargePdfSmart(textResult.text, pageCount);
    }

    return createResult(textResult.text);
  } catch (error) {
    return {
      text: "",
      wordCount: 0,
      tokenCount: 0,
      extractionMethod: "failed",
      error: error instanceof Error ? error.message : "PDF extraction failed",
    };
  }
}

/**
 * Smart extraction for large PDFs - captures intro, sample middle, and conclusion
 */
function extractLargePdfSmart(fullText: string, pageCount: number): ExtractionResult {
  const chunks: string[] = [];
  const charsPerPage = Math.ceil(fullText.length / pageCount);

  // Always include the beginning (first 2 pages worth)
  const beginningEnd = Math.min(charsPerPage * 2, fullText.length * 0.15);
  chunks.push(fullText.slice(0, beginningEnd));

  // Include a sample from the middle (pages 25-50% or around page 1/3)
  const middleStart = Math.floor(pageCount * 0.25) * charsPerPage;
  const middleEnd = Math.min(middleStart + charsPerPage * 3, fullText.length * 0.5);
  if (middleStart < middleEnd && middleStart < fullText.length) {
    chunks.push(fullText.slice(middleStart, middleEnd));
  }

  // Include the ending (last 2 pages worth)
  const endingStart = Math.max(0, fullText.length - charsPerPage * 2);
  if (endingStart < fullText.length) {
    chunks.push(fullText.slice(endingStart));
  }

  const combinedText = chunks.join("\n\n--- Section Break ---\n\n");
  const finalText = combinedText.slice(0, MAX_CONTENT_SIZE * 1.5); // Allow 50% more for smart extraction

  return {
    text: finalText,
    wordCount: finalText.split(/\s+/).filter((w) => w.length > 0).length,
    tokenCount: Math.ceil(finalText.length / CHARS_PER_TOKEN),
    extractionMethod: "partial",
    error: `Large PDF (${pageCount} pages) - extracted key sections. Consider uploading smaller sections for full coverage.`,
  };
}

/**
 * Extract DOCX text (Word documents)
 */
async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const mammoth = await getMammoth();
    const result = await mammoth.extractRawText({ buffer });
    return createResult(result.value);
  } catch (error) {
    return {
      text: "",
      wordCount: 0,
      tokenCount: 0,
      extractionMethod: "failed",
      error: error instanceof Error ? error.message : "DOCX extraction failed",
    };
  }
}

/**
 * Extract Excel data (xlsx, xls)
 */
async function extractExcel(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const xlsx = await getXlsx();
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheets: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const csv = xlsx.utils.sheet_to_csv(worksheet);
      sheets.push(`=== Sheet: ${sheetName} ===\n${csv}`);
    }

    return createResult(sheets.join("\n\n"));
  } catch (error) {
    return {
      text: "",
      wordCount: 0,
      tokenCount: 0,
      extractionMethod: "failed",
      error: error instanceof Error ? error.message : "Excel extraction failed",
    };
  }
}

/**
 * Create extraction result with word/token counts
 */
function createResult(text: string): ExtractionResult {
  // Truncate if too large
  let finalText = text;
  let extractionMethod: ExtractionResult["extractionMethod"] = "full";

  if (text.length > MAX_CONTENT_SIZE) {
    finalText = text.slice(0, MAX_CONTENT_SIZE);
    extractionMethod = "partial";
  }

  const wordCount = finalText.split(/\s+/).filter((w) => w.length > 0).length;
  const tokenCount = Math.ceil(finalText.length / CHARS_PER_TOKEN);

  return {
    text: finalText,
    wordCount,
    tokenCount,
    extractionMethod,
  };
}

/**
 * Get content preview (first 500 chars)
 */
export function getContentPreview(text: string, maxLength = 500): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}

/**
 * Estimate tokens from text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Check if content type is supported for extraction
 */
export function isExtractionSupported(mimeType: string): boolean {
  const supported = [
    "text/plain",
    "text/markdown",
    "application/json",
    "text/csv",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  return supported.includes(mimeType);
}
