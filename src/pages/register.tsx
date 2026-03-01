import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterPage() {
  return (
    <section className="mx-auto flex max-w-xl px-4 py-12">
      <Card className="w-full rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <p className="text-sm text-slate-500">
            Guardá tus datos y accedé más rápido a tus próximas compras.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" placeholder="Juan Pérez" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="juan@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input id="phone" placeholder="+54 9 ..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Crear cuenta</Button>
        </CardContent>
      </Card>
    </section>
  );
}
