import styles from './OrderTimeline.module.css'
import { Check, Clock, Package, Wrench, Truck, CheckCircle, XCircle } from 'lucide-react'

const STEPS = [
  { status: 'PENDING',       icon: Clock,        label: 'Chờ xác nhận',  desc: 'Đơn hàng đã được tạo'          },
  { status: 'CONFIRMED',     icon: Check,        label: 'Đã xác nhận',   desc: 'Nhân viên đã xác nhận đơn'     },
  { status: 'MANUFACTURING', icon: Wrench,       label: 'Đang sản xuất', desc: 'Xưởng đang gia công kính'      },
  { status: 'SHIPPING',      icon: Truck,        label: 'Đang giao',     desc: 'Shipper đang giao đến bạn'     },
  { status: 'DELIVERED',     icon: CheckCircle,  label: 'Đã giao',       desc: 'Đơn hàng hoàn tất'             },
]

const STATUS_ORDER = ['PENDING','CONFIRMED','MANUFACTURING','SHIPPING','DELIVERED']

export default function OrderTimeline({ order }) {
  if (!order) return null

  const isCancelled = order.status === 'CANCELLED'
  const currentIdx  = STATUS_ORDER.indexOf(order.status)

  return (
    <div className={styles.wrap}>
      {isCancelled ? (
        <div className={styles.cancelled}>
          <XCircle size={32} strokeWidth={1.5} style={{color:'#c62828'}}/>
          <div>
            <p className={styles.cancelTitle}>Đơn hàng đã bị huỷ</p>
            {order.cancelledAt && (
              <p className={styles.cancelDate}>
                {new Date(order.cancelledAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.timeline}>
          {STEPS.map((step, i) => {
            const isDone    = currentIdx > i
            const isActive  = currentIdx === i
            const isPending = currentIdx < i
            const Icon      = step.icon

            return (
              <div key={step.status} className={styles.step}>
                {/* Connector line */}
                {i > 0 && (
                  <div className={`${styles.line} ${isDone || isActive ? styles.lineDone : ''}`}/>
                )}

                {/* Circle */}
                <div className={`${styles.circle}
                  ${isDone   ? styles.circleDone   : ''}
                  ${isActive ? styles.circleActive : ''}
                  ${isPending? styles.circlePending: ''}
                `}>
                  {isDone
                    ? <Check size={14} strokeWidth={3}/>
                    : <Icon size={14} strokeWidth={1.5}/>
                  }
                  {isActive && <span className={styles.pulse}/>}
                </div>

                {/* Label */}
                <div className={styles.label}>
                  <p className={`${styles.stepName}
                    ${isDone   ? styles.stepNameDone   : ''}
                    ${isActive ? styles.stepNameActive : ''}
                    ${isPending? styles.stepNamePending: ''}
                  `}>{step.label}</p>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import PropTypes from 'prop-types'

OrderTimeline.propTypes = {
  order: PropTypes.shape({
    status:      PropTypes.string.isRequired,
    cancelledAt: PropTypes.string,
  }),
}
