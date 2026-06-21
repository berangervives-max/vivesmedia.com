import CityLanding from '@/components/CityLanding'
import { CITIES, cityMetadata } from '@/lib/cities-data'

const CITY = CITIES['freelance-web-orange']
export const metadata = cityMetadata(CITY)

export default function FreelanceWebOrangePage() {
  return <CityLanding city={CITY} />
}
