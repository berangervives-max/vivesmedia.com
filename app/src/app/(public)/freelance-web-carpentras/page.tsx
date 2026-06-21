import CityLanding from '@/components/CityLanding'
import { CITIES, cityMetadata } from '@/lib/cities-data'

const CITY = CITIES['freelance-web-carpentras']
export const metadata = cityMetadata(CITY)

export default function FreelanceWebCarpentrasPage() {
  return <CityLanding city={CITY} />
}
