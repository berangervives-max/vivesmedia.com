import CityLanding from '@/components/CityLanding'
import { CITIES, cityMetadata } from '@/lib/cities-data'

const CITY = CITIES['freelance-web-avignon']
export const metadata = cityMetadata(CITY)

export default function FreelanceWebAvignonPage() {
  return <CityLanding city={CITY} />
}
