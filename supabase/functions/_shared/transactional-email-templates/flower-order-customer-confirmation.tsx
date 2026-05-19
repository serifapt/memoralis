import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const BRAND_RED = '#D85151'
const BRAND_GREEN = '#2D595E'

interface Item {
  name: string
  quantity: number
  line_total: number
}

interface Props {
  senderName?: string
  deceasedName?: string
  funerariaName?: string
  items?: Item[]
  subtotal?: number
  commission?: number
  total?: number
  message?: string
  billingNif?: string
  obituaryUrl?: string
}

const fmt = (n?: number) =>
  typeof n === 'number' ? `${n.toFixed(2).replace('.', ',')} €` : '—'

const FlowerOrderCustomerEmail = ({
  senderName,
  deceasedName,
  funerariaName,
  items = [],
  subtotal,
  commission,
  total,
  message,
  billingNif,
  obituaryUrl,
}: Props) => (
  <Html lang="pt" dir="ltr">
    <Head />
    <Preview>O seu pedido de flores foi confirmado</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBar}>
          <Heading style={brand}>Memoralis</Heading>
        </Section>

        <Heading style={h1}>
          {senderName ? `Obrigado, ${senderName}!` : 'Obrigado pelo seu pedido!'}
        </Heading>
        <Text style={text}>
          O seu pedido de flores
          {deceasedName ? ` em memória de ${deceasedName}` : ''} foi confirmado
          e o pagamento processado com sucesso.
        </Text>
        {funerariaName && (
          <Text style={text}>
            A funerária <strong>{funerariaName}</strong> foi notificada e tratará
            da preparação e entrega das flores no local da cerimónia.
          </Text>
        )}

        <Hr style={hr} />

        <Heading as="h2" style={h2}>Resumo do pedido</Heading>
        {items.map((it, i) => (
          <Text key={i} style={lineItem}>
            {it.quantity}× {it.name}
            <span style={amount}>{fmt(it.line_total)}</span>
          </Text>
        ))}

        <Hr style={hr} />
        <Text style={lineItem}>Subtotal<span style={amount}>{fmt(subtotal)}</span></Text>
        <Text style={lineItem}>Taxa de serviço Memoralis<span style={amount}>{fmt(commission)}</span></Text>
        <Text style={lineTotal}>Total pago<span style={amount}>{fmt(total)}</span></Text>

        {message && (
          <>
            <Hr style={hr} />
            <Heading as="h2" style={h2}>Mensagem para o cartão</Heading>
            <Text style={quote}>"{message}"</Text>
          </>
        )}

        <Hr style={hr} />
        <Text style={muted}>
          A fatura deste pedido será emitida pela funerária
          {billingNif ? ` com o NIF ${billingNif}` : ''}. Em caso de dúvida,
          poderá responder a este email para contactar diretamente a funerária.
        </Text>

        {obituaryUrl && (
          <Text style={text}>
            <a href={obituaryUrl} style={link}>Ver obituário</a>
          </Text>
        )}

        <Text style={footer}>Com sentidas condolências,<br />Equipa Memoralis</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FlowerOrderCustomerEmail,
  subject: (d: Record<string, any>) =>
    d.deceasedName
      ? `Pedido de flores confirmado — ${d.deceasedName}`
      : 'Pedido de flores confirmado',
  displayName: 'Confirmação de pedido de flores (cliente)',
  previewData: {
    senderName: 'Maria Silva',
    deceasedName: 'João Pereira',
    funerariaName: 'Funerária Exemplo',
    items: [
      { name: 'Coroa de Rosas', quantity: 1, line_total: 80 },
      { name: 'Ramo Branco', quantity: 2, line_total: 60 },
    ],
    subtotal: 140,
    commission: 14,
    total: 154,
    message: 'Os nossos mais sentidos pêsames.',
    billingNif: '123456789',
    obituaryUrl: 'https://memoralis.pt/obituario/abc',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const headerBar = { borderBottom: `3px solid ${BRAND_RED}`, paddingBottom: '12px', marginBottom: '20px' }
const brand = { fontSize: '22px', color: BRAND_GREEN, margin: 0, fontWeight: 700, letterSpacing: '0.5px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const h2 = { fontSize: '15px', fontWeight: 'bold', color: BRAND_GREEN, margin: '20px 0 12px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const text = { fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: '0 0 14px' }
const lineItem = { fontSize: '14px', color: '#333333', margin: '0 0 8px', display: 'flex' as const, justifyContent: 'space-between' as const }
const lineTotal = { fontSize: '15px', color: '#000000', fontWeight: 'bold', margin: '8px 0 0', display: 'flex' as const, justifyContent: 'space-between' as const }
const amount = { float: 'right' as const, fontWeight: 600 }
const quote = { fontSize: '14px', color: '#555555', fontStyle: 'italic', borderLeft: `3px solid ${BRAND_RED}`, paddingLeft: '12px', margin: '0 0 14px' }
const muted = { fontSize: '12px', color: '#777777', lineHeight: '1.5', margin: '0 0 14px' }
const link = { color: BRAND_RED, textDecoration: 'underline' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }