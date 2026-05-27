/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const BRAND_RED = '#D85151'
const BRAND_GREEN = '#2D595E'

interface Props {
  name?: string
  planName?: string
  cemeteryName?: string
  graveNumber?: string
  amount?: number
  billingPeriod?: 'monthly' | 'yearly'
  passwordSetupUrl?: string
  accountUrl?: string
}

const fmt = (n?: number) =>
  typeof n === 'number' ? `${n.toFixed(2).replace('.', ',')} €` : '—'

const CareWelcomeEmail = ({
  name,
  planName,
  cemeteryName,
  graveNumber,
  amount,
  billingPeriod,
  passwordSetupUrl,
  accountUrl,
}: Props) => (
  <Html lang="pt" dir="ltr">
    <Head />
    <Preview>O seu serviço Memoralis Care está confirmado</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBar}>
          <Heading style={brand}>Memoralis Care</Heading>
        </Section>

        <Heading style={h1}>
          {name ? `Bem-vindo(a), ${name}!` : 'Bem-vindo(a)!'}
        </Heading>
        <Text style={text}>
          O seu pedido de cuidado e homenagem foi confirmado e o pagamento
          processado com sucesso. A nossa equipa irá tratar da campa com o
          mesmo carinho com que a sua família o faria.
        </Text>

        <Hr style={hr} />
        <Heading as="h2" style={h2}>Resumo da subscrição</Heading>
        {planName && <Text style={lineItem}>Plano<span style={amountStyle}>{planName}</span></Text>}
        {cemeteryName && <Text style={lineItem}>Cemitério<span style={amountStyle}>{cemeteryName}</span></Text>}
        {graveNumber && <Text style={lineItem}>Nº da campa<span style={amountStyle}>{graveNumber}</span></Text>}
        {typeof amount === 'number' && (
          <Text style={lineTotal}>
            Valor<span style={amountStyle}>
              {fmt(amount)} / {billingPeriod === 'yearly' ? 'ano' : 'mês'}
            </span>
          </Text>
        )}

        <Hr style={hr} />
        <Heading as="h2" style={h2}>Conclua o registo da sua conta</Heading>
        <Text style={text}>
          Criámos uma conta Memoralis com o seu email. Defina agora a sua
          palavra-passe para aceder ao seu painel sempre que quiser:
        </Text>
        <Text style={text}>
          Na sua conta vai encontrar o <strong>histórico de visitas</strong>,
          <strong> fotos antes/depois</strong>, <strong>faturas</strong> e
          poderá <strong>gerir ou cancelar a subscrição</strong> a qualquer
          momento.
        </Text>
        {passwordSetupUrl && (
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={passwordSetupUrl} style={btn}>
              Definir palavra-passe
            </Button>
          </Section>
        )}
        {accountUrl && (
          <Text style={muted}>
            Depois de definir a palavra-passe, pode aceder em qualquer altura em{' '}
            <a href={accountUrl} style={link}>{accountUrl}</a>.
          </Text>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          Com os melhores cumprimentos,<br />Equipa Memoralis
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CareWelcomeEmail,
  subject: 'Subscrição Memoralis Care confirmada — conclua o registo',
  displayName: 'Care — Boas-vindas e definir palavra-passe',
  previewData: {
    name: 'Maria Silva',
    planName: 'Plano Mensal',
    cemeteryName: 'Cemitério de Lisboa — Alto de São João',
    graveNumber: '123',
    amount: 50,
    billingPeriod: 'monthly',
    passwordSetupUrl: 'https://memoralis.pt/reset-password?token=xyz',
    accountUrl: 'https://memoralis.pt/account/care',
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
const amountStyle = { float: 'right' as const, fontWeight: 600 }
const muted = { fontSize: '12px', color: '#777777', lineHeight: '1.5', margin: '0 0 14px' }
const link = { color: BRAND_RED, textDecoration: 'underline' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
const btn = {
  backgroundColor: BRAND_RED,
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '15px',
  display: 'inline-block',
}