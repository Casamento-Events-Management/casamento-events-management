import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Automatically uses server-only SANITY_API_READ_TOKEN if the dataset is configured as private
const serverReadToken =
  typeof window === 'undefined' ? process.env.SANITY_API_READ_TOKEN : undefined

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  ...(serverReadToken ? { token: serverReadToken } : {}),
})
