package it.fithub.fithubspring.repository;

import it.fithub.fithubspring.domain.Meal;
import it.fithub.fithubspring.domain.MealItem;
import it.fithub.fithubspring.dto.MealItemDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Objects;

@Repository
public class MealRepository {

    private final JdbcTemplate jdbcTemplate;

    public MealRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long saveMeal(Meal meal) {
        String sql = "INSERT INTO meals (user_id, name, total_calories, date_eaten) VALUES (?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});

            ps.setLong(1, meal.getUserId());
            ps.setString(2, meal.getName());
            ps.setInt(3, meal.getTotalCalories());
            ps.setTimestamp(4, Timestamp.valueOf(meal.getDateEaten()));
            return ps;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public void saveMealItem(MealItem item) {
        String sql = "INSERT INTO meal_items (meal_id, food_name, image_url, grams, calories, proteins, carbs, fats) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        jdbcTemplate.update(sql,
                item.getMealId(),
                item.getFoodName(),
                item.getImageUrl(),
                item.getGrams(),
                item.getCalories(),
                item.getProteins(),
                item.getCarbs(),
                item.getFats()
        );
    }

    private final RowMapper<Meal> mealRowMapper = (rs, rowNum) -> {
        Meal m = new Meal();
        m.setId(rs.getLong("id"));
        m.setUserId(rs.getLong("user_id"));
        m.setName(rs.getString("name"));
        m.setTotalCalories(rs.getInt("total_calories"));
        m.setDateEaten(rs.getTimestamp("date_eaten").toLocalDateTime());
        return m;
    };

    private final RowMapper<MealItem> itemRowMapper = (rs, rowNum) -> {
        MealItem i = new MealItem();
        i.setId(rs.getLong("id"));
        i.setMealId(rs.getLong("meal_id"));
        i.setFoodName(rs.getString("food_name"));
        i.setImageUrl(rs.getString("image_url"));
        i.setGrams(rs.getInt("grams"));
        i.setCalories(rs.getInt("calories"));
        i.setProteins(rs.getDouble("proteins"));
        i.setCarbs(rs.getDouble("carbs"));
        i.setFats(rs.getDouble("fats"));
        return i;
    };

    public List<Meal> findMealsByUserId(Long userId) {
        String sql = "SELECT * FROM meals WHERE user_id = ? ORDER BY date_eaten DESC";
        List<Meal> meals = jdbcTemplate.query(sql, mealRowMapper, userId);

        for (Meal meal : meals) {
            String sqlItems = "SELECT * FROM meal_items WHERE meal_id = ?";
            List<MealItem> items = jdbcTemplate.query(sqlItems, itemRowMapper, meal.getId());
            meal.setItems(items);
        }

        return meals;
    }

    public void updateMealItem(Long itemId, MealItemDTO dto) {
        String sql = "UPDATE meal_items SET grams=?, calories=?, proteins=?, carbs=?, fats=? WHERE id=?";
        jdbcTemplate.update(sql,
                dto.getGrams(), dto.getCalories(), dto.getProteins(), dto.getCarbs(), dto.getFats(),
                itemId
        );
        updateMealTotals(itemId);
    }

    public void deleteMealItem(Long itemId) {
        String getMealIdSql = "SELECT meal_id FROM meal_items WHERE id = ?";
        Long mealId = jdbcTemplate.queryForObject(getMealIdSql, Long.class, itemId);

        String deleteSql = "DELETE FROM meal_items WHERE id=?";
        jdbcTemplate.update(deleteSql, itemId);
        recalculateMealTotals(mealId);
    }

    public void deleteMeal(Long mealId) {
        String sql = "DELETE FROM meals WHERE id = ?";
        jdbcTemplate.update(sql, mealId);
    }

    private void updateMealTotals(Long itemId) {
        String getMealIdSql = "SELECT meal_id FROM meal_items WHERE id = ?";
        Long mealId = jdbcTemplate.queryForObject(getMealIdSql, Long.class, itemId);
        recalculateMealTotals(mealId);
    }

    private void recalculateMealTotals(Long mealId) {
        String sumSql = "SELECT COALESCE(SUM(calories), 0) FROM meal_items WHERE meal_id = ?";
        Integer newTotal = jdbcTemplate.queryForObject(sumSql, Integer.class, mealId);

        String updateParentSql = "UPDATE meals SET total_calories = ? WHERE id = ?";
        jdbcTemplate.update(updateParentSql, newTotal, mealId);
    }
}