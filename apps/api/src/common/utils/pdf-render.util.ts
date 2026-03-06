import { renderToStream } from '@react-pdf/renderer';

type PdfDocumentElement = Parameters<typeof renderToStream>[0];

export function renderPdfStream(
  element: PdfDocumentElement,
): Promise<NodeJS.ReadableStream> {
  return renderToStream(element);
}
