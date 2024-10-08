import { nanoid } from "nanoid";
import { paramCase } from "change-case";
import Category from "../models/categories";
import { validateAll } from "../utils/form";
import { categories } from "../predefined/category.json";

export const all = async (req, res) => {
  try {
    const categories = await Category.query()
      .where((builder) => {
        if (req.query.name) {
          builder.where("name", "LIKE", `${req.query.name}%`);
        }

        builder.whereNull("deleted_at");
      })
      .orderBy("id", "DESC");

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Terjadi kesalahan",
    });
  }
};

export const detail = async (req, res) => {
  try {
    const category = await Category.query()
      .findById(req.params.id)
      .whereNull("deleted_at")
      .first();

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Terjadi kesalahan",
    });
  }
};

export const create = async (req, res) => {
  const rules = {
    name: "required",
  };

  const errors = await validateAll(req.body, rules);
  if (errors) {
    return res.json({
      success: false,
      message: errors,
    });
  }

  try {
    const category = await Category.query().insert({
      name: req.body.name,
      user_id: req.body.user_id,
      type: req.body.type,
      slug: `${nanoid()}-${paramCase(req.body.name)}`,
      picture: req.body.icon,
    });

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Gagal memasukkan data!",
    });
  }
};

export const bulkCreate = async (req, res) => {
  try {
    if (categories.length > 0) {
      const bulkInsert = categories.map((cat) => {
        return Category.query().insert({
          name: cat.name,
          type: cat.type,
          user_id: req.user.id,
          slug: `${nanoid()}-${paramCase(cat.name)}`,
          picture: cat.icon,
        });
      });
      const cats = await Promise.all(bulkInsert);
      return res.json({
        success: true,
        data: cats,
      });
    }
    return res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Gagal memasukkan data!",
    });
  }
};

export const edit = async (req, res) => {
  try {
    const category = await Category.query().patchAndFetchById(req.params.id, {
      name: req.body.name,
      type: cat.type,
      slug: `${nanoid()}-${paramCase(req.body.name)}`,
      picture: req.body.picture,
    });

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Gagal memasukkan data!",
    });
  }
};

export const destroy = async (req, res) => {
  try {
    const category = await Category.query().whereIn("id", req.body.ids).patch({
      deleted_at: new Date(),
    });

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Gagal menghapus!",
    });
  }
};
