import type {ReactNode} from 'react';
// Small native components inspired by the Card / Item / Badge composition patterns.
export function StoryCard({children,className=''}:{children:ReactNode;className?:string}){return <div className={'story-card '+className}>{children}</div>}
export function StoryBadge({children}:{children:ReactNode}){return <span className="story-badge">{children}</span>}
