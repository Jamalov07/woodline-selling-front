import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BookingPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Booking</h1>
        <p className="text-muted-foreground">Bu booking sahifasi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Hozircha bookingda hech narsa yo'q</p>
        </CardContent>
      </Card>
    </div>
  )
}
