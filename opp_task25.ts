/**
 * ============================================================
 * ЗАДАЧА 25. UserStatusService
 * Блок 4. Anemic Domain Model
 * ============================================================
 *
 * У пользователя есть жизненный цикл статусов: pending → active,
 * active → banned, banned → active. Нужен сервис, который будет
 * управлять переходами.
 *
 * ЗАДАНИЕ:
 *   - Создай UserStatusService.
 *   - Методы: activate, ban, reactivate.
 *   - Учитывай допустимые переходы.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. СЕРВИС СТАТУСОВ
 * ============================================================
 */
namespace WithStatusService {
  type UserRole = "user" | "admin";
  type UserStatus = "active" | "banned" | "pending";

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

  /** Переходы статусов живут здесь. Не в User. */
  class UserStatusService {
    activate(user: User): void {
      if (user.status !== "pending") {
        throw new Error("Активировать можно только pending-пользователя");
      }
      user.status = "active";
    }

    ban(user: User): void {
      if (user.status !== "active") {
        throw new Error("Забанить можно только активного пользователя");
      }
      user.status = "banned";
    }

    reactivate(user: User): void {
      if (user.status !== "banned") {
        throw new Error("Реактивировать можно только забаненного");
      }
      user.status = "active";
    }
  }

  const user = new User(1, "Иван", "ivan@example.com", "user", "pending");
  const statusService = new UserStatusService();

  statusService.activate(user);
  console.log("[status-service] статус:", user.status);

  statusService.ban(user);
  console.log("[status-service] статус:", user.status);

  /** Обойти правила легко: */
  user.status = "active"; // напрямую, без сервиса
  console.log("[status-service] после прямого изменения:", user.status);
}

/**
 * ============================================================
 * ШАГ 2. ПРОВЕРКИ НА ПРОЧНОСТЬ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Инварианты в сервисе, не в объекте
 * ----------------------------------------------
 * Правила жизненного цикла (pending → active → banned) живут
 * в UserStatusService. Сам User их не знает. Любой код может
 * написать user.status = "..." в обход сервиса — и инвариант
 * будет нарушен.
 */

/**
 * СИТУАЦИЯ 2. Пятая сущность вокруг User
 * --------------------------------------
 * Считаем: User, UserService, UserValidator, UserPermissionService,
 * UserStatusService. Пять классов, и все они крутятся вокруг
 * одного User.
 */

/**
 * СИТУАЦИЯ 3. Дублирование знания о статусе
 * -----------------------------------------
 * UserStatusService знает про статусы. Но UserValidator тоже может
 * проверять статус. UserService тоже может менять статус. Знание
 * о статусах расползается.
 */

/**
 * СИТУАЦИЯ 4. Правила не защищены
 * -------------------------------
 * Сервис старается защитить переходы. Но поля User открыты, и
 * любой может обойти сервис. Защита работает только когда все
 * соглашаются ходить через сервис.
 */

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 * Добавился пятый класс. Вокруг User собрался целый кластер
 * сервисов, каждый из которых отвечает за свою часть логики.
 * Сам User остался пустой коробкой.
 *
 * Дальше посмотрим на всю картину целиком и зафиксируем,
 * во что это превратилось.
 */