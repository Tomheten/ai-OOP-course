/**
 * ============================================================
 * ЗАДАЧА 24. UserPermissionService
 * Блок 4. Anemic Domain Model
 * ============================================================
 *
 * Новое требование: нужно проверять, может ли пользователь
 * выполнять определённые действия (например, удалять посты).
 * Добавляем отдельный сервис прав.
 *
 * ЗАДАНИЕ:
 *   - Создай UserPermissionService.
 *   - Методы: canDeletePost, canBanUser, canEditSettings.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. СЕРВИС ПРАВ
 * ============================================================
 */
namespace WithPermissionService {
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

  /** Все правила прав живут здесь. User о них не знает. */
  class UserPermissionService {
    canDeletePost(user: User): boolean {
      return user.role === "admin";
    }

    canBanUser(user: User): boolean {
      return user.role === "admin";
    }

    canEditSettings(user: User): boolean {
      return user.role === "admin" && user.status === "active";
    }
  }

  const user = new User(1, "Иван", "ivan@example.com", "user", "active");
  const admin = new User(2, "Админ", "admin@example.com", "admin", "active");
  const perms = new UserPermissionService();

  console.log("[perms] user can delete post:", perms.canDeletePost(user));
  console.log("[perms] admin can delete post:", perms.canDeletePost(admin));
  console.log("[perms] admin can edit settings:", perms.canEditSettings(admin));
}

/**
 * ============================================================
 * ШАГ 2. ПРОВЕРКИ НА ПРОЧНОСТЬ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Права — это не про User?
 * ------------------------------------
 * «Может ли пользователь удалить пост?» — это правило про
 * пользователя. Но знает его не User, а отдельный сервис.
 * User не умеет ответить на вопрос о своих правах.
 */

/**
 * СИТУАЦИЯ 2. Кластер сервисов растёт
 * -----------------------------------
 * У нас уже: User (данные), UserService (изменения),
 * UserValidator (валидация), UserPermissionService (права).
 * Вокруг одного User — четыре сущности.
 */

/**
 * СИТУАЦИЯ 3. Правила размазаны
 * -----------------------------
 * Правило «админ может банить» знает UserPermissionService.
 * Правило «email должен содержать @» знает UserValidator.
 * Правило «банить можно через UserService.banUser» знает сервис.
 *
 * Каждый сервис знает свою часть правды о User.
 */

/**
 * СИТУАЦИЯ 4. Кто настоящий хозяин User?
 * --------------------------------------
 * Задайся вопросом: если User — это сущность системы, кто её
 * «владелец»? Сам User ничего не делает. Все решения о нём
 * принимают сервисы вокруг.
 */

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 * Добавился четвёртый класс вокруг User. Кластер растёт, а User
 * остаётся пассивным. Логика о пользователе живёт в четырёх
 * разных местах.
 *
 * Дальше добавим работу со статусами — ещё один сервис.
 */