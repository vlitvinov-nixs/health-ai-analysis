import { BiomarkerStatus } from '../api/types';

export const getStatusColor = (status: BiomarkerStatus): string => {
  switch (status) {
    case 'normal':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'low':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getStatusBgColor = (status: BiomarkerStatus): string => {
  switch (status) {
    case 'normal':
      return 'bg-green-50';
    case 'high':
      return 'bg-red-50';
    case 'low':
      return 'bg-yellow-50';
    default:
      return 'bg-gray-50';
  }
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};
