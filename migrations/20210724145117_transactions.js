exports.up = function (knex) {
  return knex.schema.createTable("transactions", function (table) {
    table.bigIncrements("id");

    table.string("user_id", 255).notNullable();
    table.foreign("user_id").references("id").inTable("users");

    table.bigInteger("wallet_id").unsigned();
    table.foreign("wallet_id").references("id").inTable("wallets");

    table.bigInteger("category_id").unsigned();
    table.foreign("category_id").references("id").inTable("categories");

    table.bigInteger("budget_id").unsigned();
    table.foreign("budget_id").references("id").inTable("budgets");

    table.text("description");
    table.datetime("spent_at");

    table.integer("amount").defaultTo(0);
    table.datetime("date");

    table.timestamps(true, true);
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("transactions");
};
