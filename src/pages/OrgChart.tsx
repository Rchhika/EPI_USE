import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';

export default function OrgChart() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Organization Chart</h1>
        <p className="text-muted-foreground mt-1">Visual representation of company hierarchy</p>
      </div>

      <Card className="h-96 hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Interactive Org Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Org Chart will be implemented with React Flow</p>
            <p className="text-sm">Interactive hierarchy visualization coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}