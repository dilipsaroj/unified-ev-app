import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-semibold text-neutral-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const label = match[2];
      const href = match[3];
      nodes.push(
        <Link key={key++} href={href} className="text-brand-500 underline underline-offset-2">
          {label}
        </Link>,
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function MarkdownBody({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-h1 text-neutral-ink mb-3">
          {line.slice(2)}
        </h1>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-h2 text-neutral-ink mt-8 mb-3">
          {line.slice(3)}
        </h2>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i += 1;
      }
      elements.push(
        <aside
          key={key++}
          className="my-5 rounded-lg border border-semantic-warning/40 bg-semantic-warning/10 px-4 py-3 text-sm text-neutral-ink-2 leading-relaxed"
        >
          {renderInline(quoteLines.join(' '))}
        </aside>,
      );
      continue;
    }

    if (line.trim() === '---') {
      elements.push(<hr key={key++} className="my-8 border-neutral-border" />);
      i += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i += 1;
      }
      elements.push(
        <ul key={key++} className="mb-4 list-disc space-y-2 pl-5 text-body text-neutral-ink-2">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i += 1;
      }
      elements.push(
        <ol key={key++} className="mb-4 list-decimal space-y-2 pl-5 text-body text-neutral-ink-2">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Paragraph (may start with bold meta lines)
    const paraLines: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('- ') &&
      !/^\d+\.\s/.test(lines[i]) &&
      lines[i].trim() !== '---'
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    elements.push(
      <p key={key++} className="mb-4 text-body text-neutral-ink-2 leading-relaxed">
        {renderInline(paraLines.join(' '))}
      </p>,
    );
  }

  return <div className="max-w-2xl">{elements}</div>;
}

export default function RefundPolicyPage() {
  const filePath = path.join(process.cwd(), 'src/data/policies/refund-policy.md');
  const content = fs.readFileSync(filePath, 'utf8');

  return (
    <div className="flex min-h-full flex-col bg-neutral-bg text-neutral-ink">
      <header className="flex items-center gap-3 border-b border-neutral-border px-4 py-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-ink"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </Link>
        <span className="text-sm font-semibold text-neutral-ink-2">Legal</span>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 pb-24">
        <MarkdownBody content={content} />
      </main>
    </div>
  );
}
