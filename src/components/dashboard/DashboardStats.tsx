import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, BarChart3, Plus, Settings } from 'lucide-react';
import { Subdomain } from '../../types';

interface DashboardStatsProps {
  subdomains: Subdomain[];
  onShowAddModal: () => void;
}

export function DashboardStats({ subdomains, onShowAddModal }: DashboardStatsProps) {
  const activeSubdomains = subdomains.filter((s) => s.status === 'active').length;
  const inactiveSubdomains = subdomains.filter((s) => s.status === 'cancelled' || s.status === 'expired').length;
  const trialSubdomains = subdomains.filter((s) => s.status === 'trial').length;

  // Only show stats that have values or are always shown
  const stats = [
    {
      label: 'Active',
      value: activeSubdomains,
      icon: CheckCircle,
      color: 'text-grass-600',
      bgColor: 'bg-grass-100',
      show: true,
    },
    {
      label: 'Trial',
      value: trialSubdomains,
      icon: BarChart3,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      show: trialSubdomains > 0, // Only show if there are trial subdomains
    },
    {
      label: 'Inactive',
      value: inactiveSubdomains,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      show: true,
    },
  ].filter(stat => stat.show);

  const scrollToSubdomains = () => {
    const subdomainsSection = document.querySelector('[data-section="my-subdomains"]');
    if (subdomainsSection) {
      subdomainsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card variant="minecraft" className="mb-8">
      <CardContent className="pt-6">
        <div className={`grid gap-4 ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} mb-6`}>
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center p-4 rounded-lg border border-stone-200 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-minecraft font-bold text-minecraft-800">
                    {stat.value}
                  </p>
                  <p className="text-sm font-minecraft text-stone-600">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary text */}
        <div className="mb-6 pt-4 border-t border-stone-200">
          <p className="text-sm font-minecraft text-stone-600 text-center">
            {subdomains.length === 0 ? (
              "No subdomains created yet"
            ) : (
              <>
                You have <span className="font-bold text-minecraft-800">{subdomains.length}</span> subdomain{subdomains.length !== 1 ? 's' : ''} total
                {activeSubdomains > 0 && (
                  <>, <span className="font-bold text-grass-700">{activeSubdomains}</span> active</>
                )}
                {trialSubdomains > 0 && (
                  <>, <span className="font-bold text-yellow-700">{trialSubdomains}</span> on trial</>
                )}
                {inactiveSubdomains > 0 && (
                  <>, <span className="font-bold text-red-700">{inactiveSubdomains}</span> inactive</>
                )}
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {subdomains.length > 0 && (
            <Button
              onClick={scrollToSubdomains}
              variant="secondary"
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-minecraft hover:shadow-minecraft-hover"
              icon={Settings}
            >
              Manage
            </Button>
          )}
          <Button
            onClick={onShowAddModal}
            variant="primary"
            icon={Plus}
          >
            Add Subdomains
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}