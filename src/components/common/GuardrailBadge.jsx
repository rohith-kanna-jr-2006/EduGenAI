import React from 'react';
import { ShieldCheck, CheckCircle2, GraduationCap } from 'lucide-react';

export const GuardrailBadge = ({ level = 'k-5', className = '' }) => {
  const configs = {
    'k-5': {
      label: 'K-5 Safe',
      sub: 'Elementary Guardrail Active',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
    },
    'middle': {
      label: 'Middle School Approved',
      sub: 'Grade 6-8 Filter Active',
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: CheckCircle2,
      iconColor: 'text-blue-600',
    },
    'high': {
      label: 'High School / Advanced',
      sub: 'Grade 9-12 Curriculum',
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: GraduationCap,
      iconColor: 'text-indigo-600',
    },
    'ferpa': {
      label: 'FERPA & COPPA Verified',
      sub: 'Classroom Privacy Guaranteed',
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: ShieldCheck,
      iconColor: 'text-purple-600',
    },
  };

  const item = configs[level] || configs['k-5'];
  const Icon = item.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-medium ${item.bg} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
      <span>{item.label}</span>
    </div>
  );
};
