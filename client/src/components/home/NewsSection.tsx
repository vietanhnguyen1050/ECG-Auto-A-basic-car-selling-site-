// ─── News / Guide Section ─────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const ARTICLES = [
  {
    id: '1',
    title: '5 điều cần biết trước khi mua xe ô tô cũ',
    excerpt: 'Mua xe cũ có nhiều rủi ro nếu không chuẩn bị kỹ. Hãy kiểm tra những điều này trước khi xuống tiền.',
    date: '15/02/2026',
    category: 'Cẩm nang',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
  },
  {
    id: '2',
    title: 'So sánh Toyota Vios và Honda City 2025',
    excerpt: 'Hai mẫu xe phân khúc B được ưa chuộng nhất thị trường Việt Nam, bạn nên chọn xe nào?',
    date: '12/02/2026',
    category: 'So sánh',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=250&fit=crop',
  },
  {
    id: '3',
    title: 'Chi phí bảo dưỡng ô tô hàng năm bao nhiêu?',
    excerpt: 'Tổng hợp các khoản chi phí cần chuẩn bị khi sở hữu một chiếc ô tô tại Việt Nam.',
    date: '08/02/2026',
    category: 'Chi phí',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=250&fit=crop',
  },
];

const NewsSection = () => (
  <section className="py-12 bg-secondary/30">
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Cẩm nang ô tô</h2>
          <p className="text-sm text-muted-foreground">Kiến thức hữu ích cho người mua xe</p>
        </div>
        <Link to="/guides" className="text-sm text-accent hover:underline font-medium">
          Xem tất cả →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ARTICLES.map((article) => (
          <Link
            key={article.id}
            to={`/guides/${article.id}`}
            className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent/30 hover:shadow-card transition-all"
          >
            <div className="aspect-[16/9] overflow-hidden bg-muted">
              <img
                src={article.image}
                alt={article.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                {article.category}
              </span>
              <h3 className="font-semibold text-foreground mt-1 mb-2 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{article.date}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default NewsSection;
