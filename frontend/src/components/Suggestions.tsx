import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Zap, Users, BarChart3 } from 'lucide-react';
import Card from './Card';

interface Suggestion {
  id: number;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface SuggestionsProps {
  suggestions: Suggestion[];
  isLoading?: boolean;
}

export default function Suggestions({ suggestions, isLoading }: SuggestionsProps) {
  const iconMap: Record<string, React.ComponentType<any>> = {
    TrendingDown,
    TrendingUp,
    AlertCircle,
    Zap,
    Users,
    BarChart3,
  };

  const typeStyles = {
    warning: 'border-l-4 border-orange-400 bg-orange-50',
    success: 'border-l-4 border-green-400 bg-green-50',
    info: 'border-l-4 border-blue-400 bg-blue-50',
  };

  const priorityBadges = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Suggestions IA</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Suggestions IA</h3>
        <p className="text-gray-500 text-center py-8">
          Aucune suggestion pour le moment. Continuez vos activités!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Suggestions IA</h3>
      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const IconComponent = iconMap[suggestion.icon] || AlertCircle;
          return (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg ${typeStyles[suggestion.type]}`}
            >
              <div className="flex gap-3">
                <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        priorityBadges[suggestion.priority]
                      }`}
                    >
                      {suggestion.priority === 'high'
                        ? 'Urgent'
                        : suggestion.priority === 'medium'
                        ? 'Important'
                        : 'Info'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{suggestion.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
