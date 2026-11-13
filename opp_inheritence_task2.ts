/**
 * ============================================================
 * ЗАДАЧА B. РОСТ ДЕРЕВА НАСЛЕДОВАНИЯ
 * Дополнительный блок. Наследование
 * ============================================================
 *
 * В Задаче A мы увидели, где наследование уместно. Здесь
 * посмотрим, что происходит, когда наследование применяют там,
 * где оно не подходит, и дерево начинает расти.
 *
 * ЗАДАЧА:
 *   - Увидь проблемы растущего дерева наследования.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. НАЧИНАЕМ С БАЗОВОГО КЛАССА
 * ============================================================
 */
namespace GrowingTree {
  /** Базовый класс уведомления. */
  class Notification {
    constructor(protected message: string) {}

    send(): void {
      console.log(`Отправляем: ${this.message}`);
    }
  }

  /** Пока всё выглядит нормально. */
  class EmailNotification extends Notification {
    send(): void {
      console.log(`[EMAIL] ${this.message}`);
    }
  }

  class SmsNotification extends Notification {
    send(): void {
      console.log(`[SMS] ${this.message}`);
    }
  }

  new EmailNotification("Привет").send();
  new SmsNotification("Привет").send();
}

/**
 * ============================================================
 * ШАГ 2. ДЕРЕВО НАЧИНАЕТ РАСТИ
 * ============================================================
 * Появляются новые измерения: срочность, формат, получатель.
 */
namespace TreeGrows {
  class Notification {
    constructor(protected message: string) {}
    send(): void {
      console.log(`Отправляем: ${this.message}`);
    }
  }

  class EmailNotification extends Notification {}
  class SmsNotification extends Notification {}

  /** А теперь нужны срочные версии... */
  class UrgentEmailNotification extends EmailNotification {
    send(): void {
      console.log(`[EMAIL][СРОЧНО] ${this.message}`);
    }
  }

  class UrgentSmsNotification extends SmsNotification {
    send(): void {
      console.log(`[SMS][СРОЧНО] ${this.message}`);
    }
  }

  /** А теперь версии с вложением... */
  class EmailWithAttachmentNotification extends EmailNotification {
    send(): void {
      console.log(`[EMAIL][ВЛОЖЕНИЕ] ${this.message}`);
    }
  }

  /**
   * А что если нужно СРОЧНОЕ письмо С ВЛОЖЕНИЕМ?
   * Создавать ещё один класс?
   */

  new UrgentEmailNotification("Привет").send();
  new EmailWithAttachmentNotification("Привет").send();
}

/**
 * ============================================================
 * ШАГ 3. ПРОВЕРКИ: ПРОБЛЕМЫ РАСТУЩЕГО ДЕРЕВА
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Комбинаторный взрыв
 * --------------------------------
 * Если есть 2 типа отправки × 2 срочности × 2 формата, это уже
 * 2 × 2 × 2 = 8 классов. А с ещё одним измерением — 16.
 *
 * Каждое новое «измерение» умножает число классов. Это называется
 * комбинаторным взрывом.
 */

/**
 * СИТУАЦИЯ 2. Хрупкий базовый класс
 * ---------------------------------
 * Изменение в Notification может сломать все подклассы. Ты правишь
 * базовый класс и не знаешь, что от него зависит десять наследников.
 */

/**
 * СИТУАЦИЯ 3. Трудно переиспользовать части
 * -------------------------------------------
 * Если нужно «срочное, но без вложения» и «с вложением, но не
 * срочное», в наследовании это разные ветки. Переиспользовать
 * «срочность» отдельно от «вложения» не получится.
 */

/**
 * СИТУАЦИЯ 4. Глубина делает код непонятным
 * ------------------------------------------
 * Чтобы понять, что делает UrgentEmailWithAttachmentNotification,
 * нужно подняться по всей цепочке наследования. Это трудно читать
 * и трудно менять.
 */

/**
 * ============================================================
 * ШАГ 4. ВЗГЛЯД НА РЕШЕНИЕ
 * ============================================================
 * Вместо дерева наследования — композиция независимых измерений.
 */
namespace CompositionInstead {
  /** Контракт доставки. */
  interface DeliveryChannel {
    deliver(message: string): void;
  }

  class EmailChannel implements DeliveryChannel {
    deliver(message: string): void {
      console.log(`[EMAIL] ${message}`);
    }
  }

  class SmsChannel implements DeliveryChannel {
    deliver(message: string): void {
      console.log(`[SMS] ${message}`);
    }
  }

  /** Срочность — отдельное измерение, не подкласс. */
  type Priority = "normal" | "urgent";

  /** Вложение — ещё одно измерение. */
  type Attachment = "none" | "file";

  /**
   * Одно уведомление, а «измерения» — просто параметры.
   * Никакого комбинаторного взрыва классов.
   */
  class Notification {
    constructor(
      private message: string,
      private channel: DeliveryChannel,
      private priority: Priority = "normal",
      private attachment: Attachment = "none"
    ) {}

    send(): void {
      const prefix = this.priority === "urgent" ? "[СРОЧНО] " : "";
      this.channel.deliver(prefix + this.message);
    }
  }

  /** Любая комбинация — один и тот же класс. */
  new Notification("Привет", new EmailChannel(), "urgent").send();
  new Notification("Привет", new SmsChannel(), "normal").send();
}

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 *
 * Растущее дерево наследования приводит к:
 *   - комбинаторному взрыву классов;
 *   - хрупкому базовому классу;
 *   - трудности переиспользования частей;
 *   - непонятному коду.
 *
 * Композиция решает это: каждое «измерение» — отдельный объект
 * или параметр, и их можно комбинировать без новых классов.
 *
 * Дальше сделаем практический рефакторинг: заменим наследование
 * композицией.
 */