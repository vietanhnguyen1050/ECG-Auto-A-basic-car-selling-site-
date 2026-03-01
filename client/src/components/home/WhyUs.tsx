// ─── Why Choose Us / Features ─────────────────────────────────────────────────

import { Shield, Search, DollarSign, ThumbsUp } from 'lucide-react';

const FEATURES = [
  { icon: Shield,     title: 'Xe đã kiểm định',    desc: 'Mỗi xe đều được kiểm tra kỹ thuật và pháp lý trước khi đăng.' },
  { icon: Search,     title: 'Tìm kiếm dễ dàng',   desc: 'Lọc theo hãng, giá, khu vực – tìm đúng xe bạn muốn.' },
  { icon: DollarSign, title: 'Giá minh bạch',       desc: 'Giá thị trường cập nhật thường xuyên, không phát sinh ẩn phí.' },
  { icon: ThumbsUp,   title: 'Hỗ trợ tận tình',    desc: 'Đội ngũ tư vấn sẵn sàng hỗ trợ 7 ngày trong tuần.' },
];

const WhyUs = () => (
  <section className="py-14 bg-card">
    <div className="container">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Tại sao chọn AutoMarket?
        </h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Nền tảng mua bán xe uy tín hàng đầu Việt Nam
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-background hover:border-accent/30 hover:shadow-soft transition-all"
          >
            <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center mb-4 shadow-accent">
              <Icon className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUs;
