const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createAdvertisement = async function (data) {
  try {
    const createAdvertisement = await prisma.advertisements.create({
      data: data,
    });
    return createAdvertisement;
  } catch (err) {
    throw err;
  }
};

exports.getAdvertisementById = async function (id, host) {
  try {
    const advertisement = await prisma.advertisements.findFirst({
      where: { Id: id },
    });
    if (advertisement.imageName) {
      advertisement.imagePath = host + "/src/images/advertisements/" + advertisement.imageName;
    }
    return advertisement;
  } catch (err) {
    throw err;
  }
};

exports.getListAdvertisements = async function (host) {
  try {
    const advertisements = await prisma.advertisements.findMany();
    if (advertisements.length > 0) {
      advertisements.forEach((item) => {
        if (item.imageName) {
          item.imagePath = host + "/src/images/advertisements/" + item.imageName;
        }
      });
    }
    return advertisements;
  } catch (err) {
    throw err;
  }
};
