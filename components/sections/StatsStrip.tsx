import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { STATS } from "@/lib/content";

export function StatsStrip() {
  return (
    <section aria-label="SkinSense at a glance">
      <Container>
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-hairline shadow-soft ring-1 ring-hairline sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="group flex flex-col-reverse gap-2 bg-warm-white p-6 transition-colors duration-300 hover:bg-cream sm:p-7"
              >
                <dt className="text-[13px] leading-snug text-subtle">{stat.label}</dt>
                <dd className="text-[2.1rem] font-semibold leading-none tracking-display text-ink sm:text-[2.4rem] lg:text-[1.95rem] xl:text-[2.2rem]">
                  {stat.kind === "number" ? (
                    <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  ) : (
                    <span className="text-gradient">{stat.display}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
