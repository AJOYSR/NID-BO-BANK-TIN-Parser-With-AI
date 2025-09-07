import { Type } from '@google/genai';

export const optimizedOcrSystemPrompt = `Extract these fields from the image:
NID: name, date_of_birth, nid_number
BO: bo_id (16 digits)
TIN: tin_number (12 digits)
BANK: account_number (11/13/17 digits), routing_number (9 digits)
- Use only visible, readable text
- Use empty string if unclear
- Keep original date/number formats
- Output valid JSON only`;

export const optimizedPdfOcrPrompt = `Extract fields from PDF:
NID: name, date_of_birth, nid_number | BO: bo_id | TIN: tin_number | BANK: account_number, routing_number
Only use visible text. Use empty string if unclear. Return JSON.`;

export const optimizedNidOcrResponseSchema = {
  type: Type.OBJECT,
  properties: {
    details: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        date_of_birth: { type: Type.STRING },
        nid_number: { type: Type.STRING },
      },
      required: ['name', 'date_of_birth', 'nid_number'],
    },
  },
  required: ['details'],
} as const;

export const optimizedBoOcrResponseSchema = {
  type: Type.OBJECT,
  properties: {
    details: {
      type: Type.OBJECT,
      properties: {
        bo_id: { type: Type.STRING },
      },
      required: ['bo_id'],
    },
  },
  required: ['details'],
} as const;

export const optimizedEtinOcrResponseSchema = {
  type: Type.OBJECT,
  properties: {
    details: {
      type: Type.OBJECT,
      properties: {
        tin_number: { type: Type.STRING },
      },
      required: ['tin_number'],
    },
  },
  required: ['details'],
} as const;

export const optimizedBankOcrResponseSchema = {
  type: Type.OBJECT,
  properties: {
    details: {
      type: Type.OBJECT,
      properties: {
        account_number: { type: Type.STRING },
        routing_number: { type: Type.STRING },
      },
      required: ['account_number', 'routing_number'],
    },
  },
  required: ['details'],
} as const;
