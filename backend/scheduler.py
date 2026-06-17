from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging

logger = logging.getLogger(__name__)

def daily_deal_job():
    """
    Her gün 08:00'de çalışır.
    AI ekibinin daily_deal.py modülündeki fonksiyonu çağırır.
    """
    try:
        from daily_deal import run  # AI ekibinin dosyası
        run()
        logger.info("daily_deal_job başarıyla çalıştı.")
    except ImportError:
        logger.warning("daily_deal.py bulunamadı, AI ekibi henüz eklemedi.")
    except Exception as e:
        logger.error(f"daily_deal_job hatası: {e}")


def weekly_stats_job():
    """
    Her Pazartesi 09:00'da çalışır.
    AI ekibinin weekly_stats.py modülündeki fonksiyonu çağırır.
    """
    try:
        from weekly_stats import run  # AI ekibinin dosyası
        run()
        logger.info("weekly_stats_job başarıyla çalıştı.")
    except ImportError:
        logger.warning("weekly_stats.py bulunamadı, AI ekibi henüz eklemedi.")
    except Exception as e:
        logger.error(f"weekly_stats_job hatası: {e}")

def start_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone="Europe/Istanbul")

    # Her gün 08:00
    scheduler.add_job(
        daily_deal_job,
        trigger=CronTrigger(hour=8, minute=0),
        id="daily_deal",
        name="Günlük Fırsat Görevi",
        replace_existing=True,
    )

    # Her Pazartesi 09:00
    scheduler.add_job(
        weekly_stats_job,
        trigger=CronTrigger(day_of_week="mon", hour=9, minute=0),
        id="weekly_stats",
        name="Haftalık İstatistik Görevi",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler başlatıldı. daily_deal: 08:00, weekly_stats: Pazartesi 09:00")
    return scheduler