import { MetadataRoute } from 'next'
import { listProducts } from '@lib/data/products'
import { listCollections } from '@lib/data/collections'
import { listCategories } from '@lib/data/categories'
import { HttpTypes } from '@medusajs/types'

type SitemapEntry = {
  url: string;
  lastModified: Date;
};

// Helper function to convert date to ISO string
const toDate = (dateString?: string | null) => {
  return dateString ? new Date(dateString) : new Date()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://minimica.com'
  const currentDate = new Date()
  
  // Static routes
  const staticRoutes = [
    { url: '/', lastModified: currentDate },
    { url: '/about-us', lastModified: currentDate },
    { url: '/contact', lastModified: currentDate },
    { url: '/faq', lastModified: currentDate },
    { url: '/how-it-works', lastModified: currentDate },
    { url: '/privacy', lastModified: currentDate },
    { url: '/refund-policy', lastModified: currentDate },
    { url: '/safety', lastModified: currentDate },
    { url: '/shipping', lastModified: currentDate },
    { url: '/store', lastModified: currentDate },
    { url: '/terms', lastModified: currentDate },
  ]

  const dynamicRoutes: SitemapEntry[] = [];

  try {
    // Fetch products
    const productsResponse = await listProductsWithSort({ 
      countryCode: 'us',
      queryParams: { limit: 1000 }
    });
    
    // Add product pages
    if (productsResponse?.response && 'products' in productsResponse.response) {
      const products = productsResponse.response.products;
      if (Array.isArray(products)) {
        products.forEach((product: HttpTypes.StoreProduct) => {
          if (product.handle) {
            dynamicRoutes.push({
              url: `/products/${product.handle}`,
              lastModified: toDate(product.updated_at)
            });
          }
        });
      }
    }

    // Fetch collections
    const collectionsResponse = await listCollections({ limit: 1000 });
    
    // Add collection pages
    if (collectionsResponse?.collections) {
      collectionsResponse.collections.forEach((collection: HttpTypes.StoreCollection) => {
        if (collection.handle) {
          dynamicRoutes.push({
            url: `/collections/${collection.handle}`,
            lastModified: toDate(collection.updated_at)
          });
        }
      });
    }

    // Fetch categories
    const categoriesResponse = await listCategories({ limit: 1000 });
    
    // Add category pages
    if (Array.isArray(categoriesResponse)) {
      categoriesResponse.forEach((category: any) => {
        if (category?.handle) {
          dynamicRoutes.push({
            url: `/categories/${category.handle}`,
            lastModified: toDate(category.updated_at)
          });
        }
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Continue with static routes if there's an error
  }

  // Combine all routes
  const allRoutes = [...staticRoutes, ...dynamicRoutes]

  return allRoutes.map(route => ({
    url: `${baseUrl}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: 'weekly' as const,
    priority: route.url === '/' ? 1 : 0.8,
  }))
}

// Helper function to list products with sorting
interface ListProductsWithSortParams {
  page?: number;
  countryCode?: string;
  queryParams?: Record<string, unknown>;
}

interface ProductsResponse {
  response: {
    products: HttpTypes.StoreProduct[];
    count: number;
  };
  nextPage: number | null;
  queryParams?: any;
}

async function listProductsWithSort({
  page = 0,
  countryCode = 'us',
  queryParams = {}
}: ListProductsWithSortParams): Promise<ProductsResponse> {
  try {
    // Ensure countryCode is always a string
    const countryCodeStr = countryCode?.toString() || 'us';
    
    const response = await listProducts({
      pageParam: page,
      queryParams: {
        limit: 1000,
        ...queryParams
      },
      countryCode: countryCodeStr
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return {
      response: { products: [], count: 0 },
      nextPage: null
    };
  }
}
