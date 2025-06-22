import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CartPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Savat</h1>
        <p className="text-muted-foreground">Bu savat sahifasi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Savat ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Hozircha savatda hech narsa yo'q</p>
        </CardContent>
      </Card>
    </div>
  )
}
