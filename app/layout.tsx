import type {Metadata} from 'next';
import './room.css';
import './pitch.css';
import './clubhouse.css';
import './stories.css';
import './mobile.css';
export const metadata:Metadata={title:'Akash Ram',description:'Explore Akash Ram’s interactive sports clubhouse: projects, a working toolkit, and a little play.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}