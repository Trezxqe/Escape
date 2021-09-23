const router = require('express').Router();
const parse = require('../parsers/parser');

const sendDataToMail = require('../mailer/mailer');
const {
  Club, Price, News, User, Computer, Admin
} = require('../database/models');

// eslint-disable-next-line consistent-return
router.get('/news', async (req, res) => {
  try {
    const news = await News.findAll({
      raw: true,
    });

    if (news.length > 0) {
      const thisMomentDate = new Date().getTime();
      const newsParseDate = news[0].createdAt.getTime();
      // console.log(thisMomentDate - newsParseDate);
      if (thisMomentDate - newsParseDate < (12 * 60 * 60 * 1000)) {
        // console.log('NEWS FROM DATABASE');
        return res.status(200).json(news);
      }
      const parsingNews = await parse();

      if (parsingNews) {
        await News.destroy({
          where: {
          },
        });

        const newsPushingToDataBase = await News.bulkCreate(parsingNews);

        if (newsPushingToDataBase) {
          return res.status(200).json(newsPushingToDataBase);
        }
      }
      return res.status(200).json(news);
    }
    const parsingNews = await parse();
    const newsPushingToDataBase = await News.bulkCreate(parsingNews);

    if (newsPushingToDataBase) {
      return res.status(200).json(newsPushingToDataBase);
    }
    return res.status(200).json(news);
  } catch (error) {
    console.error(error);
  }
});

router.get('/clublist', async (req, res) => {
  try {
    const clubs = await Club.findAll({
      attributes: ['id', 'name', 'address', 'phone', 'computers'],
      raw: true,
    });
    res.json(clubs);
  } catch (error) {
    console.error(error);
  }
});

router.get('/prices', async (req, res) => {
  try {
    const prices = await Price.findAll({
      attributes: [
        'id',
        'ClubId',
        'room',
        'onehour',
        'fivehours',
        'nightweekday',
        'nightweekend',
        'morning',
        'twentyfourhours',
        'PS',
      ],
      raw: true,
    });
    res.json(prices);
  } catch (error) {
    console.error(error);
  }
});

router.post('/user', async (req, res) => {
  const { userPhone } = req.body;
  console.log(userPhone);
  try {
    const user = await User.findOne(
      {
        where: {
          phone: userPhone,
        },
      },
    );
    console.log(user);
    if (user) {
      res.json({ message: false });
    } else {
      await User.create({
        email: null,
        phone: userPhone,
      });
      res.json({ message: true });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: false, reason: 'нет связи с базой данных' });
  }
});

router.get('/computers', async (req, res) => {
  try {
    const computers = await Computer.findAll({
      attributes: [
        'id',
        'ClubId',
        'room',
        'graphics',
        'cpu',
        'monitor',
        'ram',
        'keyboard',
        'mouse',
      ],
      raw: true,
    });
    res.json(computers);
  } catch (error) {
    console.error(error);
  }
});

router.post('/message', async (req, res) => {
  const { email, message, name } = req.body;
  try {
    await sendDataToMail(email, message, name);
  } catch (error) {
    console.log(error);
    console.error(error);
    res.status(404).send(error);
  }
});

router.post('/admin', async (req, res) => {
  const {
    email, password, login, phone,
  } = req.body;
  console.log(req.body);
  try {
    const admin = await Admin.findOne({
      where: {
        login,
        email,
        phone,
        password,
      },
      raw: true,
    });
    const isAdmin = (
      admin.login === login
      && admin.password === password
      && admin.phone === phone
      && admin.email === email
    );
    if (isAdmin) {
      res.status(200).json({ isAdmin: true });
    } else {
      res.status(404).json({ isAdmin: false });
    }
  } catch (error) {
    console.error(error);
    res.status(404).send(error);
  }
});

module.exports = router;
