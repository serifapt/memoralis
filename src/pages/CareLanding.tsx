          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Honre a memória dos seus entes queridos
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Serviço de manutenção e cuidado de campas com subscrição mensal ou anual. 
            Mantenha viva a lembrança, mesmo à distância.
          </p>
          
          <Button size="lg" variant="outline" asChild>
            <Link to="/care/auth">
              Entrar na Conta
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Como funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cuidado Regular</h3>
              <p className="text-muted-foreground">
                Limpeza mensal da campa, remoção de ervas e manutenção geral por técnicos profissionais.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flower2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flores Frescas</h3>
              <p className="text-muted-foreground">
                Nos planos superiores, colocação de flores frescas mensais e decoração em datas especiais.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Relatório Fotográfico</h3>
              <p className="text-muted-foreground">
                Receba fotos antes e depois de cada visita, com acesso a todo o histórico de serviços.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Escolha o Seu Plano</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Selecione o plano que melhor se adapta às suas necessidades. 
              Todos os planos incluem relatório fotográfico após cada visita.
            </p>

            <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'annual')} className="inline-flex">
              <TabsList>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="annual">
                  Anual
                  <Badge variant="secondary" className="ml-2 text-xs">-17%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans?.map((plan) => {
                const isPopular = plan.code === 'HOMENAGEM';
                const priceId = getPriceId(plan);
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="h-12">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <div className="mb-6">
                        <span className="text-4xl font-bold">{formatPrice(getPrice(plan))}</span>
                        <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'mês' : 'ano'}</span>
                        
                        {billingPeriod === 'annual' && getAnnualSavings(plan) > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            Poupa {formatPrice(getAnnualSavings(plan))}/ano
                          </p>
                        )}
                      </div>

                      <ul className="text-left space-y-3 mb-6">
                        {(plan.includes_json || []).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={isPopular ? "default" : "outline"}
                        asChild
                      >
                        <Link to={`/care/checkout?plan=${priceId}`}>
                          Selecionar
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Todos os planos podem ser cancelados a qualquer momento.</p>
            <p className="mt-1">Pagamento seguro processado por Stripe.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Memoralis. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <Link to="/sobre" className="hover:text-foreground transition-colors">Sobre</Link>
            <Link to="/contactos" className="hover:text-foreground transition-colors">Contactos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
