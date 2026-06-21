import CityLanding from '@/components/CityLanding'
import { CITIES, cityMetadata } from '@/lib/cities-data'

const CITY = CITIES['freelance-web-nimes']
export const metadata = cityMetadata(CITY)

export default function FreelanceWebNimesPage() {
  return <CityLanding city={CITY} />
}
