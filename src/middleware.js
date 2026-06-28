export const validateSearchParams = async (request, reply) => {
    const { keyword } = request.query;
    if (keyword && keyword.trim().length < 2) {
        return reply.status(400).send({
            error: "Bad Request",
            message: "The search word must be at least two characters long."
        });
    }
};