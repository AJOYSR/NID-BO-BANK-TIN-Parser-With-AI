import {
  optimizedOcrSystemPrompt,
  optimizedNidOcrResponseSchema,
  optimizedBoOcrResponseSchema,
  optimizedEtinOcrResponseSchema,
  optimizedBankOcrResponseSchema,
  optimizedPdfOcrPrompt,
} from '../common/prompts/optimized-prompts';
import { OcrFileType } from './enums/ocr-file-type.enum';

export type JsonRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null;

export const getOptimizedSchemaForType = (type: OcrFileType): unknown => {
  switch (type) {
    case OcrFileType.NID:
      return optimizedNidOcrResponseSchema;
    case OcrFileType.BO:
      return optimizedBoOcrResponseSchema;
    case OcrFileType.TIN:
      return optimizedEtinOcrResponseSchema;
    case OcrFileType.BANK:
      return optimizedBankOcrResponseSchema;
    default:
      return optimizedNidOcrResponseSchema;
  }
};

export const getOptimizedPromptForType = (mimeType: string): string =>
  mimeType === 'application/pdf'
    ? optimizedPdfOcrPrompt
    : optimizedOcrSystemPrompt;

export const getRequiredFieldsForType = (type: OcrFileType): string[] => {
  switch (type) {
    case OcrFileType.NID:
      return ['name', 'date_of_birth', 'nid_number'];
    case OcrFileType.BO:
      return ['bo_id'];
    case OcrFileType.TIN:
      return ['tin_number'];
    case OcrFileType.BANK:
      return ['account_number'];
    default:
      return [];
  }
};

export const validateGenAIResponse = (
  response: unknown,
  type: OcrFileType,
): response is { details: JsonRecord } => {
  if (!isRecord(response) || !isRecord(response.details)) return false;
  const required = getRequiredFieldsForType(type);
  const details = response.details;
  return required.every((f) => Boolean(details[f]));
};

export const normalizeString = (value: unknown): string =>
  String(value).replace(/\s+/g, '');

export const parseNidDateFormat = (input: string): string | null =>
  input || null;

const processNidData = (details: JsonRecord): void => {
  if (typeof details.date_of_birth === 'string') {
    const formattedDate = parseNidDateFormat(details.date_of_birth);
    if (formattedDate) details.date_of_birth = formattedDate;
  }
  if (typeof details.nid_number === 'string')
    details.nid_number = normalizeString(details.nid_number);
};

const processBoData = (details: JsonRecord): void => {
  if (typeof details.bo_id === 'string')
    details.bo_id = normalizeString(details.bo_id);
};

const processTinData = (details: JsonRecord): void => {
  if (typeof details.tin_number === 'string')
    details.tin_number = normalizeString(details.tin_number);
};

const processBankData = (details: JsonRecord): void => {
  if (typeof details.account_number === 'string')
    details.account_number = normalizeString(details.account_number);
};

export const applyDocumentTypeProcessing = (
  response: { type: OcrFileType; details: JsonRecord },
  type: OcrFileType,
): void => {
  switch (type) {
    case OcrFileType.NID:
      processNidData(response.details);
      break;
    case OcrFileType.BO:
      processBoData(response.details);
      break;
    case OcrFileType.TIN:
      processTinData(response.details);
      break;
    case OcrFileType.BANK:
      processBankData(response.details);
      break;
  }
};

export const processGenAIResponse = (
  response: { details: JsonRecord },
  type: OcrFileType,
): { type: OcrFileType; details: JsonRecord } => {
  const processed: { type: OcrFileType; details: JsonRecord } = {
    type,
    details: { ...response.details },
  };
  applyDocumentTypeProcessing(processed, type);
  return processed;
};

export const parseGeminiResponse = (response: unknown): unknown => {
  if (isRecord(response) && Array.isArray(response.candidates)) {
    const candidateUnknown = response.candidates[0] as unknown;
    if (
      isRecord(candidateUnknown) &&
      isRecord(candidateUnknown.content) &&
      Array.isArray(candidateUnknown.content.parts)
    ) {
      const part = candidateUnknown.content.parts[0] as unknown;
      if (isRecord(part) && typeof part.text === 'string') {
        try {
          return JSON.parse(part.text);
        } catch {
          return null;
        }
      }
      if (
        isRecord(part) &&
        isRecord(part.inlineData) &&
        typeof part.inlineData.data === 'string'
      ) {
        try {
          const responseData = Buffer.from(
            part.inlineData.data,
            'base64',
          ).toString('utf-8');
          return JSON.parse(responseData);
        } catch {
          return null;
        }
      }
    }
  }
  if (isRecord(response) && typeof response.text === 'string') {
    try {
      return JSON.parse(response.text);
    } catch {
      return null;
    }
  }
  return null;
};
