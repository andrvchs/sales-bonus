
function calculateSimpleRevenue(purchase, _product) {
  // purchase — это одна из записей в поле items из чека в data.purchase_records
  // _product — это продукт из коллекции data.products
  const { discount: discountPercent, sale_price, quantity } = purchase;

  // Рассчитываем коэффициент скидки
  const discountMultiplier = 1 - discountPercent / 100;

  // Возвращаем выручку по формуле
  return sale_price * quantity * discountMultiplier;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  const { profit } = seller;

  // Определяем процент бонуса в зависимости от позиции в рейтинге
  let bonusPercentage;

  if (index === 0) {
    // Первое место - 15% (индекс 0)
    bonusPercentage = 0.15;
  } else if (index === 1 || index === 2) {
    // Второе и третье место - 10% (индексы 1 и 2)
    bonusPercentage = 0.1;
  } else if (index === total - 1) {
    // Последнее место - 0% (последний индекс в массиве)
    bonusPercentage = 0;
  } else {
    // Все остальные - 5%
    bonusPercentage = 0.05;
  }

  // Расчет итогового бонуса
  const bonus = profit * bonusPercentage;

  // Округление до 2 знаков после запятой
  return parseFloat(bonus.toFixed(2));
}

/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // purchase — это одна из записей в поле items из чека в data.purchase_records
  // _product — это продукт из коллекции data.products
  const { discount: discountPercent, sale_price, quantity } = purchase;

  // Рассчитываем коэффициент скидки
  const discountMultiplier = 1 - discountPercent / 100;

  // Возвращаем выручку по формуле
  return sale_price * quantity * discountMultiplier;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  const { profit } = seller;

  // Определяем процент бонуса в зависимости от позиции в рейтинге
  let bonusPercentage;

  if (index === 0) {
    // Первое место - 15% (индекс 0)
    bonusPercentage = 0.15;
  } else if (index === 1 || index === 2) {
    // Второе и третье место - 10% (индексы 1 и 2)
    bonusPercentage = 0.1;
  } else if (index === total - 1) {
    // Последнее место - 0% (последний индекс в массиве)
    bonusPercentage = 0;
  } else {
    // Все остальные - 5%
    bonusPercentage = 0.05;
  }

  // Расчет итогового бонуса
  const bonus = profit * bonusPercentage;

  // Округление до 2 знаков после запятой
  return parseFloat(bonus.toFixed(2));
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // Проверка входящих данных
  // Проверка структуры данных
  if (
    !data ||
    !Array.isArray(data.sellers) ||
    !Array.isArray(data.products) ||
    !Array.isArray(data.purchase_records)
  ) {
    throw new Error("Некорректная структура данных");
  }

  // Проверка наличия данных
  if (
    data.sellers.length === 0 ||
    data.products.length === 0 ||
    data.purchase_records.length === 0
  ) {
    throw new Error("Отсутствуют необходимые данные");
  }

  // @TODO: Проверка наличия опций
  // Проверка опций
  if (!options || typeof options !== "object") {
    throw new Error("Некорректный параметр options");
  }

  const { calculateRevenue, calculateBonus } = options;

  // Проверка функций
  if (typeof calculateRevenue !== "function") {
    throw new Error("calculateRevenue должна быть функцией");
  }

  if (typeof calculateBonus !== "function") {
    throw new Error("calculateBonus должна быть функцией");
  }

  // @TODO: Подготовка промежуточных данных для сбора статистики

  const sellerStats = data.sellers.map((seller) => ({
    // Основная информация о продавце
    id: seller.id,
    firstName: seller.first_name,
    lastName: seller.last_name,
    startDate: seller.start_date,
    position: seller.position,

    // Статистические данные
    totalSales: 0, // количество продаж (чеков)
    totalAmount: 0, // общая сумма выручки
    totalDiscount: 0, // общая сумма скидок
    totalTransactions: 0, // количество транзакций
    totalItemsSold: 0, // общее количество проданных единиц товара
    profit: 0, // прибыль
    revenue: 0, // выручка (будем считать отдельно)

    // Для расчетов
    customerCount: new Set(), // уникальные покупатели
    uniqueProductsSold: new Set(), // уникальные проданные товары
    products_sold: {}, // количество проданных товаров по SKU
    transactionsByMonth: {}, // транзакции по месяцам
  }));

  // @TODO: Индексация продавцов и товаров для быстрого доступа

  // Создаем индекс продавцов для быстрого доступа
  const sellerIndex = Object.fromEntries(
    sellerStats.map((seller) => [seller.id, seller]),
  );

  const productIndex = Object.fromEntries(
    data.products.map((product) => [product.sku, product]),
  );

  // @TODO: Расчет выручки и прибыли для каждого продавца

  // Перебираем все чеки покупок
  data.purchase_records.forEach((record) => {
    const seller = sellerIndex[record.seller_id];

    if (!seller) {
      console.warn(`Продавец с ID ${record.seller_id} не найден`);
      return;
    }

    // Увеличиваем количество продаж (чеков)
    seller.totalSales += 1;

    // Увеличиваем общую сумму выручки (total_amount из чека)
    seller.totalAmount += record.total_amount;

    // Увеличиваем общую сумму скидок
    seller.totalDiscount += record.total_discount;

    // Добавляем покупателя в множество уникальных покупателей
    seller.customerCount.add(record.customer_id);

    // Обрабатываем месяц транзакции для группировки
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!seller.transactionsByMonth[monthKey]) {
      seller.transactionsByMonth[monthKey] = 0;
    }
    seller.transactionsByMonth[monthKey] += 1;

    // Обрабатываем каждый товар в чеке
    record.items.forEach((item) => {
      const product = productIndex[item.sku];

      if (!product) {
        console.warn(`Товар с SKU ${item.sku} не найден`);
        return;
      }

      // Добавляем товар в множество уникальных проданных товаров
      seller.uniqueProductsSold.add(item.sku);

      // Увеличиваем общее количество проданных единиц товара
      seller.totalItemsSold += item.quantity;

      // Учитываем количество проданных товаров по SKU
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;

      // Расчет себестоимости (cost)
      const cost = product.purchase_price * item.quantity;

      // Расчет выручки с учетом скидки через функцию calculateRevenue
      // Здесь item - это запись о покупке товара в чеке
      const revenue = calculateRevenue(item, product);
      const roundedRevenue = Math.round(revenue * 100) / 100;

      // Расчет прибыли: выручка минус себестоимость
      const itemProfit = revenue - cost;

      // Увеличиваем общую прибыль продавца
      seller.profit += itemProfit;

      // Также накапливаем выручку
      seller.revenue += roundedRevenue;
    });
  });

  // @TODO: Сортировка продавцов по прибыли

  // Сортируем продавцов по убыванию прибыли
  sellerStats.sort((a, b) => b.profit - a.profit);

  // @TODO: Назначение премий на основе ранжирования
  const totalSellers = sellerStats.length;

  sellerStats.forEach((seller) => {
    seller.profit = parseFloat(seller.profit.toFixed(2));
    seller.revenue = parseFloat(seller.revenue.toFixed(2));
  });

  sellerStats.forEach((seller, index) => {
    // Бонус рассчитывается уже на округленной прибыли
    seller.bonus = calculateBonus(index, totalSellers, seller);
    seller.bonus = Math.round(seller.bonus * 100) / 100;

    const productsArray = Object.entries(seller.products_sold)
      .map(([sku, quantity]) => ({ sku, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    seller.top_products = productsArray;
  });

  // @TODO: Подготовка итоговой коллекции с нужными полями

  return sellerStats.map((seller) => ({
    seller_id: seller.id,
    name: `${seller.firstName} ${seller.lastName}`,
    revenue: +seller.revenue.toFixed(2), // Выручка с 2 знаками после запятой
    profit: +seller.profit.toFixed(2), // Прибыль с 2 знаками после запятой
    sales_count: seller.totalSales, // Количество продаж
    top_products: seller.top_products, // Топ-10 товаров
    bonus: +seller.bonus.toFixed(2), // Бонус с 2 знаками после запятой
  }));
}