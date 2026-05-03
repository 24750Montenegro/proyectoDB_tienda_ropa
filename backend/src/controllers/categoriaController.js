const categoriaModel = require('../models/categoriaModel');

async function listar(req, res, next) {
  try {
    const categorias = await categoriaModel.listarTodas();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' });
    }
    const categoria = await categoriaModel.obtenerPorId(id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const categoria = await categoriaModel.crear({
      nombre: nombre.trim(),
      descripcion,
    });
    res.status(201).json(categoria);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoria con ese nombre' });
    }
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' });
    }
    const { nombre, descripcion } = req.body;
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const categoria = await categoriaModel.actualizar(id, {
      nombre: nombre.trim(),
      descripcion,
    });
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }
    res.json(categoria);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoria con ese nombre' });
    }
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' });
    }
    const eliminado = await categoriaModel.eliminar(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    // 23503 = foreign_key_violation
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'No se puede eliminar: hay productos asociados a esta categoria',
      });
    }
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
