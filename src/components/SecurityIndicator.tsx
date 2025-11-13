import { Shield, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SecurityIndicator = () => {
  const securityFeatures = [
    { name: 'DDoS Protection', status: 'Active', icon: Shield },
    { name: 'Rate Limiting', status: 'Active', icon: CheckCircle },
    { name: 'Data Encryption', status: 'Active', icon: Lock },
    { name: 'Input Sanitization', status: 'Active', icon: CheckCircle },
    { name: 'CORS Protection', status: 'Active', icon: Shield },
  ];

  return (
    <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg">Security Status</CardTitle>
        </div>
        <CardDescription>
          Your application is protected with enterprise-grade security
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-900 border"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{feature.name}</span>
                </div>
                <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                  {feature.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
