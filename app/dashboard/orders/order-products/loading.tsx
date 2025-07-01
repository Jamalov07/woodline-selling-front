import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function OrderProductsLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-4"></div>
          <div className="flex items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded flex-1 max-w-sm animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
