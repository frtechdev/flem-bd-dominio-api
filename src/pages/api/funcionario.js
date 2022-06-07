import { db } from "services/database";

export default async function handler(req, res) {
  const { matricula } = req.query;
  try {
    await db.connect();
    const rs = await db.query(
      `select * from bethadba.foempregados e where e.codi_emp = 1 and e.i_depto != 1 and i_empregados = ${matricula}`
    );
    return res.json(rs)
  } catch (error) {
    console.log(error.message)
    res.status(500).json({status: 500, message: error.message});
  }
}