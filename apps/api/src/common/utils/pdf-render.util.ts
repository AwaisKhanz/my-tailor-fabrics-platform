import { renderToStream } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

type PdfDocumentElement = Parameters<typeof renderToStream>[0];

/**
 * React-PDF's render API currently expects a narrower element type than React 19.
 * Keep this compatibility bridge centralized to avoid scattered assertions.
 */
function toPdfDocumentElement(element: ReactElement): PdfDocumentElement {
  return element as unknown as PdfDocumentElement;
}

export function renderPdfStream(
  element: ReactElement,
): Promise<NodeJS.ReadableStream> {
  return renderToStream(toPdfDocumentElement(element));
}
