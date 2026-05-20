import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
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
  deceasedName?: string
  ceremonyLocation?: string
  ceremonyDate?: string
  items?: Item[]
  subtotal?: number
  commission?: number
  amountToReceive?: number
  senderName?: string
  senderEmail?: string
  senderPhone?: string
  message?: string
  observations?: string
  billingNif?: string
  billingName?: string
  billingAddress?: string
  billingPostalCode?: string
  billingCity?: string
  orderUrl?: string
  orderId?: string
}

const fmt = (n?: number) =>
  typeof n === 'number' ? `${n.toFixed(2).replace('.', ',')} €` : '—'

const FlowerOrderFunerariaEmail = ({
  deceasedName,
  ceremonyLocation,
  ceremonyDate,
  items = [],
  subtotal,
  commission,
  amountToReceive,
  senderName,
  senderEmail,
  senderPhone,
  message,
  observations,
  billingNif,
  billingName,
  billingAddress,
  billingPostalCode,
  billingCity,
  orderUrl,
  orderId,
}: Props) => (
  <Html lang="pt" dir="ltr">
    <Head />
    <Preview>Novo pedido de flores pago</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBar}>
          <Heading style={brand}>Memoralis</Heading>
        </Section>

        <Heading style={h1}>🌹 Novo pedido de flores pago</Heading>
        {deceasedName && (
          <Text style={text}>
            Para o obituário de <strong>{deceasedName}</strong>.
          </Text>
        )}
        {(ceremonyLocation || ceremonyDate) && (
          <Text style={text}>
            <strong>Cerimónia:</strong>{' '}
            {[ceremonyLocation, ceremonyDate].filter(Boolean).join(' • ')}
          </Text>
        )}

        <Hr style={hr} />

        <Heading as="h2" style={h2}>Produtos encomendados</Heading>
        {items.map((it, i) => (
          <Text key={i} style={lineItem}>
            {it.quantity}× {it.name}
            <span style={amount}>{fmt(it.line_total)}</span>
          </Text>
        ))}

        <Hr style={hr} />
        <Text style={lineItem}>Subtotal<span style={amount}>{fmt(subtotal)}</span></Text>
        <Text style={lineItem}>Taxa Memoralis<span style={amount}>− {fmt(commission)}</span></Text>
        <Text style={lineTotalReceive}>
          Valor a receber<span style={amount}>{fmt(amountToReceive)}</span>
        </Text>
        <Text style={muted}>
          Transferido para a sua conta Stripe (líquido de comissão Memoralis).
        </Text>

        <Hr style={hr} />
        <Heading as="h2" style={h2}>Dados do cliente</Heading>
        {senderName && <Text style={text}><strong>Nome:</strong> {senderName}</Text>}
        {senderEmail && <Text style={text}><strong>Email:</strong> {senderEmail}</Text>}
        {senderPhone && <Text style={text}><strong>Telefone:</strong> {senderPhone}</Text>}

        {message && (
          <>
            <Heading as="h2" style={h2}>Mensagem para o cartão</Heading>
            <Text style={quote}>"{message}"</Text>
          </>
        )}

        {observations && (
          <>
            <Heading as="h2" style={h2}>Observações</Heading>
            <Text style={text}>{observations}</Text>
          </>
        )}

        {(billingNif || billingName) && (
          <>
            <Hr style={hr} />
            <Heading as="h2" style={h2}>Dados de faturação (cliente solicitou fatura)</Heading>
            {billingName && <Text style={text}>{billingName}</Text>}
            {billingNif && <Text style={text}><strong>NIF:</strong> {billingNif}</Text>}
            {billingAddress && (
              <Text style={text}>
                {billingAddress}
                {billingPostalCode || billingCity
                  ? `, ${[billingPostalCode, billingCity].filter(Boolean).join(' ')}`
                  : ''}
              </Text>
            )}
          </>
        )}

        {orderUrl && (
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={orderUrl} style={button}>Ver pedido no Memoralis</Button>
          </Section>
        )}

        {orderId && (
          <Text style={footer}>
            ID do pedido: {orderId}
          </Text>
        )}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FlowerOrderFunerariaEmail,
  subject: (d: Record<string, any>) =>
    d.deceasedName
      ? `Novo pedido de flores — ${d.deceasedName}`
      : 'Novo pedido de flores',
  displayName: 'Notificação de novo pedido (funerária)',
  previewData: {
    deceasedName: 'João Pereira',
    ceremonyLocation: 'Igreja Matriz de Arcos de Valdevez',
    ceremonyDate: '20 maio 2026, 15h00',
    items: [
      { name: 'Coroa de Rosas', quantity: 1, line_total: 80 },
      { name: 'Ramo Branco', quantity: 2, line_total: 60 },
    ],
    subtotal: 140,
    commission: 14,
    amountToReceive: 140,
    senderName: 'Maria Silva',
    senderEmail: 'maria@example.com',
    senderPhone: '+351 912 345 678',
    message: 'Os nossos mais sentidos pêsames.',
    observations: 'Entregar antes das 14h00.',
    billingNif: '123456789',
    billingName: 'Maria Silva',
    billingAddress: 'Rua das Flores 10',
    billingPostalCode: '4970-786',
    billingCity: 'Arcos de Valdevez',
    orderUrl: 'https://memoralis.pt/dashboard',
    orderId: 'abcd-1234',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const headerBar = { borderBottom: `3px solid ${BRAND_RED}`, paddingBottom: '12px', marginBottom: '20px' }
const brand = { fontSize: '22px', color: BRAND_GREEN, margin: 0, fontWeight: 700, letterSpacing: '0.5px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const h2 = { fontSize: '15px', fontWeight: 'bold', color: BRAND_GREEN, margin: '20px 0 12px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const text = { fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: '0 0 10px' }
const lineItem = { fontSize: '14px', color: '#333333', margin: '0 0 8px', display: 'flex' as const, justifyContent: 'space-between' as const }
const lineTotalReceive = { fontSize: '16px', color: BRAND_GREEN, fontWeight: 'bold', margin: '10px 0 6px', display: 'flex' as const, justifyContent: 'space-between' as const }
const amount = { float: 'right' as const, fontWeight: 600 }
const quote = { fontSize: '14px', color: '#555555', fontStyle: 'italic', borderLeft: `3px solid ${BRAND_RED}`, paddingLeft: '12px', margin: '0 0 14px' }
const muted = { fontSize: '12px', color: '#777777', lineHeight: '1.5', margin: '0 0 14px' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const button = { backgroundColor: BRAND_RED, color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }
const footer = { fontSize: '11px', color: '#999999', margin: '20px 0 0', textAlign: 'center' as const }