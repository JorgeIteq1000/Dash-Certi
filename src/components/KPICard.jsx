import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const KPICard = ({ title, value, subtitle, icon, variant = "default" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50 text-green-900";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-900";
      case "destructive":
        return "border-red-200 bg-red-50 text-red-900";
      default:
        return "border-gray-200 bg-white text-gray-900";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "destructive":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-4 w-4 ${getIconStyles()}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
