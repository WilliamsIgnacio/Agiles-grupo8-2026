import type { Category } from '../types/category';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/categories`;

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error(`Error al obtener las categorías: ${response.statusText}`);
  }

  const categories: Category[] = await response.json();
  return categories;
};