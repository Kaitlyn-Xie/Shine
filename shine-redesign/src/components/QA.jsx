import { useState } from 'react'
import {
  SearchIcon, ChevronDownIcon, ThumbsUpIcon,
  MessageIcon, PinIcon, CloseIcon, Avatar
} from './Icons'

const FAQS = [
  { q: 'How to open a bank account?', a: 'Visit any local Bank of America or Citizens Bank branch with your Harvard ID, passport, and I-20. Most accounts can be opened same-day with no minimum balance for students.' },
  { q: 'Where to get a SIM card?', a: 'T-Mobile and AT&T stores near Harvard Square offer student plans. You can also get a prepaid SIM at CVS or Walgreens with your passport.' },
  { q: 'How to register for classes?', a: 'Log into my.harvard.edu, navigate to Academics > Course Registration. Add/drop period runs the first two weeks of each semester.' },
  { q: 'How do I get a Harvard ID?', a: 'Visit the Harvard ID Office in the Smith Campus Center (1350 Mass Ave) with your acceptance letter and passport. Takes about 15 minutes.' },
  { q: 'Where is the international students office?', a: 'The Harvard International Office (HIO) is at 1350 Massachusetts Ave, Holyoke Center 800. They handle all visa and immigration matters.' },
]

const COMMUNITY_QS = [
  {
    id: 1, username: 'Anonymous', anon: true,
    question: 'Does anyone know if the dining halls have halal options?',
    answers: 12, helpful: 34, time: '2h ago',
  },
  {
    id: 2, username: 'Kenji T.', anon: false, initials: 'KT', country: 'Japan',
    question: 'Best way to travel from Harvard to downtown Boston on weekends?',
    answers: 8, helpful: 21, time: '5h ago',
  },
  {
    id: 3, username: 'Sofia R.', anon: false, initials: 'SR', country: 'Germany',
    question: 'Is there a community for European students? Looking to connect!',
    answers: 6, helpful: 19, time: '1d ago',
  },
  {
    id: 4, username: 'Anonymous', anon: true,
    question: 'Any advice for managing culture shock in the first few weeks?',
    answers: 23, helpful: 67, time: '2d ago',
  },
]

export default function QA() {
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [showAsk, setShowAsk] = useState(false)
  const [question, setQuestion] = useState('')
  const [questions, setQuestions] = useState(COMMUNITY_QS)

  const submitQuestion = () => {
    if (!question.trim()) return
    setQuestions(prev => [{
      id: Date.now(), username: 'You', anon: false, initials: 'ME', country: '',
      question: question.trim(), answers: 0, helpful: 0, time: 'Just now',
    }, ...prev])
    setQuestion('')
    setShowAsk(false)
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        background: '#fff', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <span style={{ fontSize: 19, fontWeight: 800 }}>Q&A</span>
        <button style={iconBtn}><SearchIcon size={20} color="#4A4A4A" /></button>
      </div>

      <div style={{ padding: '16px 12px' }}>
        {/* FAQ Section */}
        <div style={{
          background: '#fff', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: 16,
        }}>
          <div style={{
            padding: '13px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <PinIcon size={15} color="var(--orange)" />
            <span style={{ fontWeight: 800, fontSize: 14 }}>Common Questions</span>
          </div>
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px',
                  background: expandedFaq === i ? '#FFFBF0' : 'none',
                  border: 'none', cursor: 'pointer',
                  borderBottom: i < FAQS.length - 1 || expandedFaq === i ? '1px solid var(--border)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{faq.q}</span>
                <div style={{ transition: 'transform 0.2s', transform: expandedFaq === i ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                  <ChevronDownIcon size={15} color="var(--orange)" />
                </div>
              </button>
              {expandedFaq === i && (
                <div style={{
                  padding: '4px 16px 14px', fontSize: 13, color: 'var(--text-secondary)',
                  lineHeight: 1.65, background: '#FFFBF0',
                  borderBottom: i < FAQS.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Community Questions heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <MessageIcon size={15} color="var(--orange)" />
          <span style={{ fontWeight: 800, fontSize: 14 }}>Community Questions</span>
        </div>

        {questions.map((q, i) => (
          <div key={q.id} className="fade-in" style={{
            background: '#fff', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)', padding: 16, marginBottom: 12,
            animationDelay: `${i * 0.05}s`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              {q.anon
                ? <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#EFEFEF', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <UserIconSm />
                  </div>
                : <Avatar name={q.username} size={32} bg="linear-gradient(135deg, #FFC94A, #FF9A3C)" />
              }
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{q.username}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {q.country ? `${q.country} · ` : ''}{q.time}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 12 }}>{q.question}</p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageIcon size={14} color="#BBBBBB" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{q.answers} answers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ThumbsUpIcon size={14} color="#BBBBBB" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{q.helpful} helpful</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ask CTA */}
      <div style={{ padding: '0 12px 24px' }}>
        <button
          onClick={() => setShowAsk(true)}
          style={{
            width: '100%', padding: 16,
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,154,60,0.3)',
          }}>
          Ask a Question
        </button>
      </div>

      {/* Ask Modal */}
      {showAsk && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200,
        }} onClick={(e) => e.target === e.currentTarget && setShowAsk(false)}>
          <div className="slide-up" style={{
            background: '#fff', borderRadius: '24px 24px 0 0',
            width: '100%', maxWidth: 430, padding: 24, paddingBottom: 40,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800 }}>Ask a Question</h2>
              <button onClick={() => setShowAsk(false)} style={iconBtn}>
                <CloseIcon size={20} color="#4A4A4A" />
              </button>
            </div>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What would you like to know?"
              style={{
                width: '100%', minHeight: 120, padding: 14,
                border: '1.5px solid var(--border)', borderRadius: 12,
                fontSize: 15, lineHeight: 1.6, outline: 'none',
                fontFamily: 'inherit', resize: 'none', marginBottom: 16,
              }}
            />
            <button
              onClick={submitQuestion}
              disabled={!question.trim()}
              style={{
                width: '100%', padding: 14,
                background: question.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--border)',
                border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700,
                cursor: question.trim() ? 'pointer' : 'default',
              }}>
              Post Question
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// tiny inline icon for anonymous avatar
import { UserIcon } from './Icons'
const UserIconSm = () => <UserIcon size={16} color="#AAAAAA" />

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
