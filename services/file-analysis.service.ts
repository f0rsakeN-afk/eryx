/**
 * File Analysis Service
 * Analyzes uploaded file content for AI context
 */

import prisma from "@/lib/prisma";

export interface FileAnalysisResult {
  fileId: string;
  fileName: string;
  content: string;
  tokenCount: number;
  success: boolean;
  error?: string;
}

export interface AnalysisResult {
  files: FileAnalysisResult[];
  totalTokens: number;
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
}

/**
 * Analyze files by extracting and summarizing their content for AI context
 */
export async function analyzeFiles(
  fileIds: string[]
): Promise<AnalysisResult> {
  if (!fileIds || fileIds.length === 0) {
    return {
      files: [],
      totalTokens: 0,
      totalFiles: 0,
      successfulFiles: 0,
      failedFiles: 0,
    };
  }

  const files = await prisma.file.findMany({
    where: {
      id: { in: fileIds },
      status: "READY",
    },
    select: {
      id: true,
      name: true,
      type: true,
      extractedContent: true,
      tokenCount: true,
    },
  });

  const results: FileAnalysisResult[] = [];
  let totalTokens = 0;
  let successfulFiles = 0;
  let failedFiles = 0;

  for (const file of files) {
    if (file.extractedContent) {
      const truncatedContent = truncateContent(file.extractedContent, 10000);
      const estimatedTokens = Math.ceil(truncatedContent.length / 4);

      results.push({
        fileId: file.id,
        fileName: file.name,
        content: truncatedContent,
        tokenCount: estimatedTokens,
        success: true,
      });
      totalTokens += estimatedTokens;
      successfulFiles++;
    } else {
      results.push({
        fileId: file.id,
        fileName: file.name,
        content: "",
        tokenCount: 0,
        success: false,
        error: "No extracted content available",
      });
      failedFiles++;
    }
  }

  return {
    files: results,
    totalTokens,
    totalFiles: fileIds.length,
    successfulFiles,
    failedFiles,
  };
}

/**
 * Format file analysis results for system prompt injection
 */
export function formatFileAnalysisForPrompt(
  analysis: AnalysisResult
): string {
  if (analysis.files.length === 0) return "";

  const fileSections = analysis.files
    .filter((f) => f.success)
    .map((f, i) => {
      const type = getFileTypeLabel(f.fileName);
      return `[File ${i + 1}] ${type}: ${f.fileName}
${f.content}`;
    })
    .join("\n\n");

  return `

## Attached Files Analysis

${fileSections}

## Instructions
- Use the content above from attached files to answer the user's question
- If the user asks about specific content in the files, cite which file [1], [2], etc. you're referencing
- If information is from your own knowledge (not the files), don't cite
`;
}

/**
 * Get a human-readable file type label
 */
function getFileTypeLabel(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return "PDF Document";
    case "doc":
    case "docx":
      return "Word Document";
    case "txt":
      return "Text File";
    case "md":
      return "Markdown";
    case "csv":
      return "CSV Data";
    case "json":
      return "JSON Data";
    case "xml":
      return "XML Data";
    case "html":
      return "HTML Document";
    case "py":
    case "js":
    case "ts":
    case "tsx":
    case "java":
    case "cpp":
    case "c":
    case "go":
    case "rs":
      return "Source Code";
    default:
      return ext.toUpperCase() + " File";
  }
}

/**
 * Truncate content to max length while preserving word boundaries
 */
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;

  // Try to break at a word boundary
  const truncated = content.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Get files attached to a message
 */
export async function getMessageFiles(messageId: string): Promise<string[]> {
  const messageFiles = await prisma.messageFile.findMany({
    where: { messageId },
    select: { fileId: true },
  });
  return messageFiles.map((mf) => mf.fileId);
}
