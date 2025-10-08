import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-memoralis.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Memoralis" className="h-12 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão Funerária
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.pt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Palavra-passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Palavra-passe</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
              />
            </div>
          )}

          <Button className="w-full bg-primary hover:bg-primary/90">
            {isLogin ? "Entrar" : "Registar"}
          </Button>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? "Não tem conta? Registar"
                : "Já tem conta? Entrar"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
