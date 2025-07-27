// src/app/gyms/[id]/dashboard/LoadingSkeleton.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        <Skeleton className="h-80 w-full" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-2" />
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}