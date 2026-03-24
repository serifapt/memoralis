
-- Create triggers for budget quote line calculations
CREATE TRIGGER trg_calc_line_total
BEFORE INSERT OR UPDATE ON public.budget_quote_lines
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalc_line_total();

CREATE TRIGGER trg_recalc_after_line
AFTER INSERT OR UPDATE OR DELETE ON public.budget_quote_lines
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalc_after_line_change();
