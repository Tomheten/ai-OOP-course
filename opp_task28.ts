/**
 * ============================================================
 * ЗАДАЧА 28. RICH DOMAIN MODEL
 * Блок 4. Anemic Domain Model
 * ============================================================
 *
 * В Задачах 21–26 мы собрали анемичную модель: User — коробка
 * с данными, а вся логика в четырёх сервисах. В Задаче 27 мы
 * определили, кому на самом деле принадлежат правила.
 *
 * Теперь переносим поведение ВНУТРЬ User. User становится
 * богатой (rich) моделью.
 *
 * ЗАДАНИЕ:
 *   - Перенеси правила и поведение из сервисов в User.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. БЫЛО: АНЕМИЧНАЯ МОДЕЛЬ
 * ============================================================
 * Короткое напоминание того, что было в Задачах 21–26.
 */
namespace AnemicRecap {
  type UserRole = "user" | "admin";
  type UserStatus = "active" | "banned" | "pending";

  /** Пустой User. */
  class User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;

    constructor(id: number, name: string, email: string, role: UserRole, status: UserStatus) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.role = role;
      this.status = status;
    }
  }

  /** Правила живут здесь. */
  class UserValidator {
    validate(user: User): boolean {
      return !!user.name.trim() && user.email.includes("@");
    }
  }

  class UserStatusService {
    activate(user: User): void {
      if (user.status !== "pending") throw new Error("Только pending");
      user.status = "active";
    }
    ban(user: User): void {
      if (user.status !== "active") throw new Error("Только active");
      user.status = "banned";
    }
  }

  class UserPermissionService {
    canDeletePost(user: User): boolean {
      return user.role === "admin";
    }
  }

  const user = new User(1, "Иван", "ivan@example.com", "user", "pending");
  const validator = new UserValidator();
  const statusService = new UserStatusService();
  const perms = new UserPermissionService();

  statusService.activate(user);
  console.log("[anemic] статус:", user.status);
  console.log("[anemic] валиден:", validator.validate(user));
}

/**
 * ============================================================
 * ШАГ 2. ПРОВЕРКИ: ЧТО НУЖНО ПЕРЕНЕСТИ
 * ============================================================
 */

/**
 * Из Задачи 27 мы знаем, какие правила принадлежат User:
 *
 *   1. Имя не пустое                    → конструктор / метод изменения
 *   2. Email содержит "@"               → конструктор / метод изменения
 *   3. Активировать можно только pending → метод activate
 *   4. Забанить можно только активного   → метод ban
 *   5. Реактивировать можно только banned → метод reactivate
 *   6. Удалять посты может только админ  → метод canDeletePost
 *   7. Банить других может только админ  → метод canBanUser
 *
 * Все эти правила опираются ТОЛЬКО на состояние самого User.
 * Значит, все они должны жить в User.
 */

/**
 * ============================================================
 * ШАГ 3. СТАЛО: RICH DOMAIN MODEL
 * ============================================================
 * User становится богатой моделью: все правила живут внутри.
 */
namespace RichUser {
  type UserRole = "user" | "admin";
  type UserStatus = "active" | "banned" | "pending";

  class User {
    private readonly id: number;
    private name: string;
    private email: string;
    private role: UserRole;
    private status: UserStatus;

    constructor(id: number, name: string, email: string, role: UserRole) {
      this.id = id;
      this.setName(name);      // валидация в конструкторе
      this.setEmail(email);    // валидация в конструкторе
      this.role = role;
      this.status = "pending"; // все новые пользователи — pending
    }

    /** Правила имени живут здесь. */
    setName(name: string): void {
      if (!name.trim()) {
        throw new Error("Имя не может быть пустым");
      }
      this.name = name;
    }

    /** Правила email живут здесь. */
    setEmail(email: string): void {
      if (!email.includes("@")) {
        throw new Error("Некорректный email");
      }
      this.email = email;
    }

    /** Жизненный цикл живёт здесь. */
    activate(): void {
      if (this.status !== "pending") {
        throw new Error("Активировать можно только pending-пользователя");
      }
      this.status = "active";
    }

    ban(): void {
      if (this.status !== "active") {
        throw new Error("Забанить можно только активного пользователя");
      }
      this.status = "banned";
    }

    reactivate(): void {
      if (this.status !== "banned") {
        throw new Error("Реактивировать можно только забаненного");
      }
      this.status = "active";
    }

    /** Права живут здесь. */
    canDeletePost(): boolean {
      return this.role === "admin";
    }

    canBanUser(): boolean {
      return this.role === "admin";
    }

    /** Геттеры для чтения. */
    getStatus(): UserStatus {
      return this.status;
    }

    getName(): string {
      return this.name;
    }
  }

  const user = new User(1, "Иван", "ivan@example.com", "user");
  user.activate();
  console.log("[rich] статус:", user.getStatus());

  /** User защищён со всех сторон. */
  // new User(2, "", "ivan@example.com", "user");      // ❌ пустое имя
  // new User(3, "Иван", "no-email", "user");          // ❌ плохой email
  // user.ban();                                       // ❌ только что активировали, уже банить нельзя
}

/**
 * ============================================================
 * ШАГ 4. СРАВНЕНИЕ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Правила больше не размазаны
 * ---------------------------------------
 * Все правила о состоянии User живут в User. Не нужно помнить,
 * какой сервис за что отвечает.
 */

/**
 * СИТУАЦИЯ 2. Обойти правила нельзя
 * ---------------------------------
 * Поля приватные. Единственный путь к ним — методы с проверками.
 */

/**
 * СИТУАЦИЯ 3. User знает о себе сам
 * ---------------------------------
 * Может ли пользователь удалить пост? Спроси у него:
 *   user.canDeletePost()
 * Не нужно искать сервис прав.
 */

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 *
 * Мы построили Rich Domain Model — богатую модель предметной
 * области. User теперь не коробка с данными, а полноценный
 * объект, который знает свои правила и защищает себя.
 *
 * Ситуация              | Анемичная модель       | Богатая модель
 * ----------------------|------------------------|---------------------------
 * Данные + поведение    | разведены              | вместе
 * Правила               | в сервисах             | в объекте
 * Защита                | легко обойти           | не обойти
 * «Что может объект?»   | искать по сервисам     | видно по методам
 *
 * Дальше посмотрим, как это упрощает архитектуру в целом.
 */