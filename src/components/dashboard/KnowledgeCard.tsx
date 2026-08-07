import React, { memo } from 'react'

type KnowledgeCardProps = {
  recentKnowledge: string
  popularProperty: string
  recentlyShared: string
  bookmarks: number
}

function KnowledgeCard({ recentKnowledge, popularProperty, recentlyShared, bookmarks }: KnowledgeCardProps) {
  return (
    <section className="db-card">
      <div className="db-eyebrow">ศูนย์ความรู้</div>
      <h2>ข้อมูลส่วนกลาง</h2>
      <div className="db-info-list">
        <div><span>ข้อมูลล่าสุด</span><strong>{recentKnowledge}</strong></div>
        <div><span>ทรัพย์ยอดนิยม</span><strong>{popularProperty}</strong></div>
        <div><span>แชร์ล่าสุด</span><strong>{recentlyShared}</strong></div>
        <div><span>รายการที่บันทึก</span><strong>{bookmarks}</strong></div>
      </div>
    </section>
  )
}

export default memo(KnowledgeCard)
